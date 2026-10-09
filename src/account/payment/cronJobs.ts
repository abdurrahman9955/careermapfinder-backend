
import cron from 'node-cron';
import { sendRenewalReminders, suspendOverdueSubscriptions } from './subscriptionService';

export function startCronJobs(): void {
    const DAILY_SCHEDULE = '0 0 * * *'; 

    const reminderJob = cron.schedule(DAILY_SCHEDULE, async () => {
        await sendRenewalReminders();
    }, {
        timezone: "Etc/UTC"
    });

    const suspensionJob = cron.schedule(DAILY_SCHEDULE, async () => {
        await suspendOverdueSubscriptions();
    }, {
        timezone: "Etc/UTC"
    });

    reminderJob.start();
    suspensionJob.start();
}
