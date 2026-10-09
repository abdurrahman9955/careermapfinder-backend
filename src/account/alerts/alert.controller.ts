import { Request, Response } from 'express';
import prisma from '../../utils/prisma';
import { CreateAlertInput, UpdateAlertInput, SubmitResponseInput } from './alert.schema';

export class AlertController {
  // Create Alert
  public static async createAlert(req: Request<{}, {}, CreateAlertInput>, res: Response): Promise<void> {
    try {
      const alert = await prisma.alert.create({
        data: {
          ...req.body,
          targetDate: new Date(req.body.targetDate),
        },
      });
      res.status(201).json({ status: 'success', data: alert });
    } catch (error) {
      res.status(500).json({ status: 'error', message: (error as Error).message });
    }
  }

  // Get All Alerts for User
  public static async getUserAlerts(req: Request<{ userId: string }>, res: Response): Promise<void> {
    try {
      const alerts = await prisma.alert.findMany({
        where: { userId: req.params.userId },
        include: { alertResponse: true },
        orderBy: { createdAt: 'desc' },
      });
      res.status(200).json({ status: 'success', data: alerts });
    } catch (error) {
      res.status(500).json({ status: 'error', message: (error as Error).message });
    }
  }

  // Get Single Alert
  public static async getAlertById(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const alert = await prisma.alert.findUnique({
        where: { id: req.params.id },
        include: { alertResponse: true },
      });

      if (!alert) {
        res.status(404).json({ status: 'error', message: 'Alert configuration not found' });
        return;
      }

      res.status(200).json({ status: 'success', data: alert });
    } catch (error) {
      res.status(500).json({ status: 'error', message: (error as Error).message });
    }
  }

  // Update Alert Configuration
  public static async updateAlert(req: Request<{ id: string }, {}, UpdateAlertInput>, res: Response): Promise<void> {
    try {
      const data = { ...req.body };
      if (data.targetDate) {
        data.targetDate = new Date(data.targetDate) as any;
      }

      const alert = await prisma.alert.update({
        where: { id: req.params.id },
        data,
      });

      res.status(200).json({ status: 'success', data: alert });
    } catch (error) {
      res.status(500).json({ status: 'error', message: (error as Error).message });
    }
  }

  // Delete Alert
  public static async deleteAlert(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      await prisma.alert.delete({ where: { id: req.params.id } });
      res.status(200).json({ status: 'success', message: 'Alert removed successfully' });
    } catch (error) {
      res.status(500).json({ status: 'error', message: (error as Error).message });
    }
  }

  // Upsert Active Response (Single Active Response Rule)
  public static async submitCheckInResponse(req: Request<{}, {}, SubmitResponseInput>, res: Response): Promise<void> {
    try {
      const { alertId, description } = req.body;

      const alert = await prisma.alert.findUnique({
        where: { id: alertId },
        include: { alertResponse: true },
      });

      if (!alert) {
        res.status(404).json({ status: 'error', message: 'Alert profile not found' });
        return;
      }

      const existingResponse = alert.alertResponse[0];

      let responseRecord;
      if (existingResponse) {
        // Update the single active response record
        responseRecord = await prisma.alertResponse.update({
          where: { id: existingResponse.id },
          data: { description, updatedAt: new Date() },
        });
      } else {
        // Create initial response record
        responseRecord = await prisma.alertResponse.create({
          data: { alertId, description },
        });
      }

      // If alert was closed due to inactivity, reactivate it automatically on reply
      if (alert.isClose || !alert.isactive) {
        await prisma.alert.update({
          where: { id: alertId },
          data: { isactive: true, isClose: false },
        });
      }

      res.status(200).json({ status: 'success', data: responseRecord });
    } catch (error) {
      res.status(500).json({ status: 'error', message: (error as Error).message });
    }
  }
}