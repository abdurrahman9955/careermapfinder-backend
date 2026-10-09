import cron from 'node-cron';
import prisma from '../../utils/prisma';
import { AIService } from './ai.service';
import { EmailService } from './email.service';

export class CronService {
  public static initScheduler(): void {
    // Runs every 15 minutes to check for scheduled alert dispatches
    cron.schedule('*/15 * * * *', async () => {
      console.log('[Cron] Evaluating pending focus alerts...');
      await CronService.processDispatches();
    });
  }

  private static async processDispatches(): Promise<void> {
    const activeAlerts = await prisma.alert.findMany({
      where: {
        isactive: true,
        isClose: false,
      },
      include: {
        user:true,
        alertResponse: {
          orderBy: { updatedAt: 'desc' },
          take: 1,
        },
      },
    });

    const now = new Date();

    for (const alert of activeAlerts) {
      if (!CronService.shouldSendAlert(alert, now)) {
        continue;
      }

      const latestResponse = alert.alertResponse[0] || null;
      const user = alert.user || null;

      const missedCount = CronService.calculateMissedCount(alert.lastSendingDate, latestResponse?.updatedAt);

      if (missedCount >= 3) {
        // Send final warning email and close alert
        const assignment = await AIService.generateFocusTask(user, alert, latestResponse, true);
        await EmailService.sendFocusAlertEmail(alert.contactEmail, alert.targetGoalName, assignment, alert.id, true);

        // Update database: create response snapshot and deactivate/close alert
        await prisma.$transaction([
          prisma.alertResponse.create({
            data: {
              alertId: alert.id,
              title: assignment.title,
              description: assignment.description,
            },
          }),
          prisma.alert.update({
            where: { id: alert.id },
            data: {
              lastSendingDate: now,
              isactive: false,
              isClose: true,
            },
          }),
        ]);
        continue;
      }

      // Normal Dispatch Loop
      const assignment = await AIService.generateFocusTask(user, alert, latestResponse, false);
      await EmailService.sendFocusAlertEmail(alert.contactEmail, alert.targetGoalName, assignment, alert.id, false);

      // Create/Update the active alert response record
      if (latestResponse) {
        await prisma.alertResponse.update({
          where: { id: latestResponse.id },
          data: {
            title: assignment.title,
            description: assignment.description,
          },
        });
      } else {
        await prisma.alertResponse.create({
          data: {
            alertId: alert.id,
            title: assignment.title,
            description: assignment.description,
          },
        });
      }

      await prisma.alert.update({
        where: { id: alert.id },
        data: { lastSendingDate: now },
      });
    }
  }

  private static calculateMissedCount(lastSendingDate: Date, lastResponseDate?: Date): number {
    if (!lastResponseDate) {
      // Calculate dispatches since creation assuming 1 day interval
      const diffTime = Math.abs(new Date().getTime() - lastSendingDate.getTime());
      return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }

    if (lastResponseDate < lastSendingDate) {
      const diffTime = Math.abs(new Date().getTime() - lastSendingDate.getTime());
      return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    return 0;
  }

  private static shouldSendAlert(alert: any, now: Date): boolean {
    const [targetHour, targetMinute] = alert.preferredAlertTime.split(':').map(Number);
    const currentHour = now.getUTCHours(); // Standardized UTC evaluation
    const currentMinute = now.getUTCMinutes();

    // Check time window match
    const timeMatches = currentHour === targetHour && Math.abs(currentMinute - targetMinute) < 15;
    if (!timeMatches) return false;

    // Check cadence based on frequency setting
    const daysSinceLastSend = (now.getTime() - new Date(alert.lastSendingDate).getTime()) / (1000 * 3600 * 24);

    if (alert.preferredFrequency === 'DAILY') return daysSinceLastSend >= 0.9;
    if (alert.preferredFrequency === 'WEEKLY') return daysSinceLastSend >= 6.9;
    if (alert.preferredFrequency === 'MILESTONE_DRIVEN') {
      const daysToDeadline = (new Date(alert.targetDate).getTime() - now.getTime()) / (1000 * 3600 * 24);
      if (daysToDeadline <= 7) return daysSinceLastSend >= 0.9; // Accelerates to daily
      return daysSinceLastSend >= 3.4; // Mid-week checks
    }

    return false;
  }
}