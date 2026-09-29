
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

// import cron from 'node-cron';
// import { sendRenewalReminders, suspendOverdueSubscriptions } from './subscriptionService';

// export function startCronJobs(): void {
//    // console.log('Starting scheduled cron jobs...');

//     // Cron Pattern: '0 0 * * *' runs at midnight (00:00) every day.
//     // For testing, you might use '* * * * *' (every minute) or a specific time.
//     const DAILY_SCHEDULE = '0 0 * * *'; 

//     const reminderJob = cron.schedule(DAILY_SCHEDULE, async () => {
//        // console.log(`[CRON] Running Subscription Reminder Job at ${new Date().toISOString()}`);
//         await sendRenewalReminders();
//     }, {
//         scheduled: true,
//         timezone: "Etc/UTC" 
//     });

//     console.log('Subscription Reminder Job scheduled daily at midnight UTC.');

//     const suspensionJob = cron.schedule(DAILY_SCHEDULE, async () => {
//        // console.log(`[CRON] Running Suspension Check Job at ${new Date().toISOString()}`);
//         await suspendOverdueSubscriptions();
//     }, {
//         scheduled: true,
//         timezone: "Etc/UTC" 
//     });

//     //console.log('Subscription Suspension Job scheduled daily at midnight UTC.');

//     reminderJob.start();
//     suspensionJob.start();
// }
