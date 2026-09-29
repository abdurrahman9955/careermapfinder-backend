import prisma from '../../utils/prisma';
import { sendSubscriptionReminderEmail, sendSuspensionNotificationEmail } from './emailService';

/**
 * @param {number} days 
 * @returns {Date}
 */
const getDateNDaysFromNow = (days: number): Date => {
    const date = new Date();
    date.setHours(0, 0, 0, 0); 
    date.setDate(date.getDate() + days);
    return date;
};

export async function sendRenewalReminders(): Promise<void> {
    console.log('--- Starting Subscription Reminder Check ---');
    
    const targetDate = getDateNDaysFromNow(3);
    const dayAfterTarget = getDateNDaysFromNow(4);

    try {
      
        const subscriptionsToRemind = await prisma.subscription.findMany({
            where: {
                nextBillingDate: {
                    gte: targetDate, 
                    lt: dayAfterTarget,
                },
                isSuspended: false,
                isActive: true,
            },
            include: {
                user: {
                    select: { email: true }
                }
            },
        });

        console.log(`Found ${subscriptionsToRemind.length} subscriptions due in 3 days.`);

        for (const sub of subscriptionsToRemind) {
            const email = sub.user?.email || sub.email; 

            if (email) {
                const billingDateString = sub.nextBillingDate?.toISOString().split('T')[0] || 'Unknown Date';
                try {
                    await sendSubscriptionReminderEmail(
                        email,
                        3,
                        billingDateString
                    );
                } catch (emailError) {
                    console.error(`Failed to send reminder for Subscription ID ${sub.id}:`, emailError);
                }
            } else {
                console.warn(`Skipping reminder for Subscription ID ${sub.id}: No email found.`);
            }
        }
    } catch (error) {
        console.error('Error finding subscriptions for reminders:', error);
    }

    console.log('--- Finished Subscription Reminder Check ---');
}

export async function suspendOverdueSubscriptions(): Promise<void> {
    console.log('--- Starting Subscription Suspension Check ---');

    const threeDaysAgo = getDateNDaysFromNow(-3);

    try {
       
        const overdueSubscriptions = await prisma.subscription.findMany({
            where: {
                nextBillingDate: {
                    lte: threeDaysAgo, 
                },
                isSuspended: false, 
                isActive: true, 
            },
            include: {
                user: {
                    select: { email: true }
                }
            },
        });

        console.log(`Found ${overdueSubscriptions.length} subscriptions overdue by 3+ days.`);

        for (const sub of overdueSubscriptions) {
            const email = sub.user?.email || sub.email;

            try {
               
                await prisma.subscription.update({
                    where: { id: sub.id },
                    data: {
                        isSuspended: true,
                        isActive: false,
                        cancellationDate: new Date(),
                    },
                });
                
                console.log(`Suspended Subscription ID ${sub.id}`);

                if (email) {
                    const dueDateString = sub.nextBillingDate?.toISOString().split('T')[0] || 'Unknown Date';
                    await sendSuspensionNotificationEmail(
                        email,
                        dueDateString
                    );
                } else {
                     console.warn(`Skipping suspension email for Subscription ID ${sub.id}: No email found.`);
                }

            } catch (updateError) {
                console.error(`Failed to process suspension for Subscription ID ${sub.id}. 
                Rolling back/Error handling needed.`, updateError);
            }
        }
    } catch (error) {
        console.error('Error finding subscriptions for suspension:', error);
    }

    console.log('--- Finished Subscription Suspension Check ---');
}
