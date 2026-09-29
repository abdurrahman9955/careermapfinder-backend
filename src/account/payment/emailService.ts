import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY!);

const SENDER_EMAIL = 'noreply@infobeatlive.com';

/**
 * @param title The email's main subject/title.
 * @param content The main body content (HTML).
 * @param ctaText The Call-to-Action button text.
 * @param ctaLink The Call-to-Action button URL.
 * @returns The complete HTML string for the email body.
 */
function getBaseEmailHtml(title: string, content: string, ctaText?: string, ctaLink?: string): string {
    const PRIMARY_COLOR = '#2563EB'; 
    const ACCENT_COLOR = '#F59E0B'; 
    const LIGHT_GRAY = '#F3F4F6';

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>${title}</title>
            <style type="text/css">
                /* Global Styles */
                body { margin: 0; padding: 0; background-color: ${LIGHT_GRAY}; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif; }
                a { color: ${PRIMARY_COLOR}; text-decoration: none; }
                p { line-height: 1.7; margin: 0 0 16px 0; color: #374151; text-align: justify; }
                
                /* Layout */
                .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
                .header { background-color: ${PRIMARY_COLOR}; padding: 30px 25px; text-align: center; }
                .content-body { padding: 25px 30px 40px 30px; }
                .footer { background-color: #1F2937; color: #D1D5DB; padding: 30px 25px; font-size: 12px; text-align: center; }

                /* CTA Button */
                .cta-button {
                    display: inline-block; 
                    padding: 14px 30px; 
                    background-color: ${PRIMARY_COLOR};
                    color: #ffffff !important; 
                    text-decoration: none; 
                    border-radius: 8px; 
                    font-size: 16px; 
                    font-weight: 600;
                    letter-spacing: 0.5px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="https://placehold.co/180x40/${PRIMARY_COLOR.substring(1)}/ffffff?text=InfoBeatLive" 
                        alt="" 
                        style="max-width: 180px; height: auto;">
                </div>

                <div class="content-body">
                    <h1 style="color: #111827; text-align: center; font-size: 24px; margin-top: 0; margin-bottom: 20px;">
                    ${title}</h1>
                    ${content}
                    
                    ${ctaLink && ctaText ? `
                        <div style="text-align: center; margin-top: 30px; margin-bottom: 20px;">
                            <a href="${ctaLink}" class="cta-button">
                                ${ctaText}
                            </a>
                        </div>
                    ` : ''}
                </div>

                <div class="footer">
                    <p style="color: #9CA3AF; font-size: 13px; margin: 0;">
                        Stay ahead of the curve.
                    </p>
                    <div style="margin: 15px 0;">
                        <a href="https://www.infobeatlive.com/support" style="color: #9CA3AF; margin: 0 10px;
                         font-weight: 500;">Support Center</a> | 
                        <a href="https://www.infobeatlive.com/privacy" style="color: #9CA3AF; margin: 0 10px;
                         font-weight: 500;">Privacy</a> |
                        <a href="https://www.infobeatlive.com/contact" style="color: #9CA3AF; margin: 0 10px;
                         font-weight: 500;">Contact Us</a>
                    </div>
                    <p style="color: #6B7280; font-size: 11px; margin-top: 15px; line-height: 1.5;">
                        You are receiving this email because you have an active account with InfoBeatLive.<br>
                        This is an automated system email. Please do not reply directly to this message.
                    </p>
                    <p style="color: #6B7280; font-size: 11px; margin-top: 5px;">
                        © ${new Date().getFullYear()} InfoBeatLive, All rights reserved.
                      | 123 Business Blvd, Suite 400, City, State, 10001
                    </p>
                </div>
            </div>
        </body>
        </html>
    `;
}

/**
 * @param {string} toEmail 
 * @param {number} daysRemaining 
 * @param {string} nextBillingDate 
 */
export async function sendSubscriptionReminderEmail(
    toEmail: string,
    daysRemaining: number,
    nextBillingDate: string
): Promise<void> {
    const dashboardLink = `https://www.infobeatlive.com/dashboard/main`;
    const WARNING_COLOR = '#F97316'; // Orange

    const content = `
        <p>Hello,</p>
        <p>
            This is a friendly reminder that the subscription for ${'InfoBeatLive'} is scheduled to renew in 
            ${ daysRemaining} days on ${nextBillingDate}.
        </p>
        <p>
            To ensure continuous, uninterrupted access to all premium features, please click below to verify or update 
            your payment details.
        </p>
        <div style="background-color: #FFFBEB; border-left: 5px solid ${WARNING_COLOR}; padding: 18px; margin: 25px 0;
         border-radius: 6px;">
            <p style="font-size: 15px; color: #4B5563; margin: 0; font-weight: 600;">
                <span style="color: ${WARNING_COLOR}; margin-right: 8px;">&#9888;</span> Important Renewal Details:
            </p>
            <p style="font-size: 14px; color: #4B5563; margin-top: 10px; margin-bottom: 0; padding-left: 20px;">
                <strong>Renewal Date:</strong> <span style="font-weight: 700;">${nextBillingDate}</span><br/>
                <strong>Days Remaining:</strong> <span style="font-weight: 700;">${daysRemaining}</span>
            </p>
        </div>
        <p style="text-align: center; margin-top: 30px; font-weight: 500;">
            Click the button below to manage your subscription:
        </p>
    `;

    const emailHtml = getBaseEmailHtml(
        'Subscription Renewal Reminder',
        content,
        'Manage Subscription & Billing',
        dashboardLink
    );

    try {
        await resend.emails.send({
            from: SENDER_EMAIL,
            to: toEmail,
            subject: `Action Required: Your ${'InfoBeatLive'} Subscription Renews in ${daysRemaining} Days`,
            html: emailHtml,
        });
        console.log(`[Email] Reminder email sent to ${toEmail} for company ${'InfoBeatLive'}.`);
    } catch (error) {
        console.error(`[Email] Resend subscription reminder email error for ${toEmail}:`, error);
        throw new Error('Failed to send subscription reminder email via Resend'); 
    }
}

/**
 * @param {string} toEmail 
 * @param {string} nextBillingDate
 */
export async function sendSuspensionNotificationEmail(
    toEmail: string,
    nextBillingDate: string
): Promise<void> {
    const pricingLink = `https://www.infobeatlive.com/pricing`;
    const ERROR_COLOR = '#DC2626'; // Red

    const content = `
        <p>Hello,</p>
        <p>
            We regret to inform you that the subscription for ${'InfoBeatLive'} has been temporarily suspended due to an 
            issue with the renewal on ${nextBillingDate}.
        </p>
        <p>
            Access to premium features has been temporarily disabled. To reactivate your account and restore service 
            immediately, please update your payment method or select a new plan.
        </p>
        <div style="background-color: #FEF2F2; border-left: 5px solid ${ERROR_COLOR}; padding: 18px; margin: 25px 0;
         border-radius: 6px;">
            <p style="font-size: 15px; color: #4B5563; margin: 0; font-weight: 600;">
                <span style="color: ${ERROR_COLOR}; margin-right: 8px;">&#10060;</span> Account Status: Suspended
            </p>
            <p style="font-size: 14px; color: #4B5563; margin-top: 10px; margin-bottom: 0; padding-left: 20px;">
                <strong>Renewal Attempt Date:</strong> <span style="font-weight: 700;">${nextBillingDate}</span>
            </p>
        </div>
        <p style="text-align: center; margin-top: 30px; font-weight: 500;">
            Click the button below to resolve this issue and reactivate your subscription:
        </p>
    `;

    const emailHtml = getBaseEmailHtml(
        'Subscription Suspension Notice',
        content,
        'Reactivate Account',
        pricingLink
    );

    try {
        await resend.emails.send({
            from: SENDER_EMAIL,
            to: toEmail,
            subject: `Account Suspended: Resolve Payment Issue for ${'InfoBeatLive'}`,
            html: emailHtml,
        });
        console.log(`[Email] Suspension email sent to ${toEmail} for company ${'InfoBeatLive'}.`);
    } catch (error) {
        console.error(`[Email] Resend suspension email error for ${toEmail}:`, error);
        throw new Error('Failed to send suspension notification email via Resend');
    }
}


