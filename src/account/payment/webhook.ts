import express from 'express';
import dotenv from 'dotenv';
import crypto from 'crypto';
import prisma from '../../utils/prisma';
import { Resend } from 'resend';
import { io } from '../../app';

dotenv.config();

const webhookRouter = express.Router();

const resend = new Resend(process.env.RESEND_API_KEY!); 

const SENDER_EMAIL = 'support@infobeatlive.com'; 

const PRIMARY_COLOR = '#2563EB'; 
const SUCCESS_COLOR = '#10B981'; 
const ALERT_COLOR = '#DC2626'; 
const BG_LIGHT = '#F3F4F6';
const TEXT_DARK = '#1F2937';

/**
 * @param {string} toEmail 
 * @param {string} fullName 
 * @param {string} planType 
 */
async function sendSubscriptionFailureEmail(
    toEmail: string,
    fullName: string,
    planType: string
): Promise<void> {
    const dashboardLink = `https://www.infobeatlive.com/dashboard/main`;

    try {
        await resend.emails.send({
            from: SENDER_EMAIL,
            to: toEmail,
            subject: `Immediate Action Required: Payment Failed for ${'InfoBeatLive'} Subscription`,
            html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                <title>Subscription Payment Failed</title>
                <style>
                    body { margin: 0; padding: 0; background-color: ${BG_LIGHT}; font-family: -apple-system, 
                    BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans",
                     "Helvetica Neue", sans-serif; }
                    a { color: ${PRIMARY_COLOR}; text-decoration: none; }
                    p { line-height: 1.7; margin: 0 0 16px 0; color: ${TEXT_DARK}; text-align: justify; }
                    .container { background-color: #ffffff; max-width: 600px; margin: 20px auto; border-radius: 12px;
                     overflow: hidden; box-shadow: 0 15px 25px rgba(0, 0, 0, 0.1); border: 1px solid #E5E7EB; }
                    .header { background-color: #B91C1C; /* Darker Red */ color: #ffffff; padding: 35px 25px;
                     text-align: center; }
                    .header h1 { margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 0.5px;}
                    .body { padding: 35px 30px; color: ${TEXT_DARK}; }
                    .footer { background-color: #1F2937; color: #9CA3AF; padding: 25px 30px; font-size: 12px;
                     text-align: center; }
                    .alert-box { padding: 20px; background-color: #FEF2F2; border-left: 6px solid ${ALERT_COLOR};
                     margin: 25px 0; border-radius: 6px; color: #991B1B; font-weight: 500; }
                    .button { display: inline-block; margin-top: 25px; background-color: ${ALERT_COLOR};
                     color: #ffffff !important; padding: 14px 30px; text-decoration: none; border-radius: 8px;
                      font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                    .logo-text { font-size: 12px; color: #FEE2E2; margin-top: 8px; font-weight: 400;}
                </style>
            </head>
            <body>
                <div class="container">
                    <!-- Header Section - High Impact Red -->
                    <div class="header">
                        <h1>&#10060; Payment Failure Notice</h1>
                        <p class="logo-text">InfoBeatLive Billing Alert</p>
                    </div>

                    <!-- Main Content Body -->
                    <div class="body">
                        <p style="font-size: 16px;">Hello ${fullName},</p>

                        <p style="font-size: 16px;">
                            We are writing to urgently inform you that the payment for your 
                            ${'InfoBeatLive'} ${planType} subscription could not be processed.
                        </p>
                        
                        <div class="alert-box">
                            <p style="margin: 0;">
                                **Payment Status: Failed**<br/>
                                <strong style="color: ${ALERT_COLOR};">Immediate action is required</strong> 
                                to prevent a temporary suspension of your service. Please update your billing details.
                            </p>
                        </div>

                        <p style="font-size: 16px;">
                            To avoid any disruption, please update your payment information as soon as possible via your 
                            billing dashboard:
                        </p>

                        <div style="text-align: center;">
                            <a href="${dashboardLink}" class="button">
                                Update Payment Details
                            </a>
                        </div>
                        
                        <p style="margin-top: 30px; font-size: 14px; color: #6B7280;">If you continue to experience issues,
                         please contact our support team immediately.</p>

                        <p style="margin-top: 30px; font-size: 15px; color: #4B5563;">
                            Sincerely,<br />
                            The InfoBeatLive Team
                        </p>
                    </div>

                    <!-- Footer Section -->
                    <div class="footer">
                        <a href="https://www.infobeatlive.com/support" style="color: #9CA3AF; margin: 0 10px;
                         font-weight: 500;
                        ">Support Center</a> | 
                        <a href="https://www.infobeatlive.com/privacy" style="color: #9CA3AF; margin: 0 10px; 
                        font-weight: 500;">Privacy</a>
                        <p style="color: #6B7280; font-size: 11px; margin-top: 15px;">
                            &copy; ${new Date().getFullYear()} InfoBeatLive, All rights reserved.
                        </p>
                    </div>
                </div>
            </body>
            </html>`,
        });
        console.log(`[Email] Subscription failure email sent to ${toEmail}.`);
    } catch (error) {
        console.error('Resend subscription failure email error:', error);
        throw new Error('Failed to send subscription failure notification email.');
    }
}


/**
 * @param {string} email
 * @param {string} fullName
 */
async function sendResendOtp(email: string, fullName?:string): Promise<void> {
    const WEBSITE_LINK = 'https://www.infobeatlive.com';

    try {
        await resend.emails.send({
            from: 'noreply@infobeatlive.com',
            to: email,
            subject:`Welcome to InfoBeatLive, ${fullName || 'New User'}!`,
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                    <title>Welcome & Verification</title>
                    <style>
                        body { margin: 0; padding: 0; background-color: ${BG_LIGHT}; font-family: -apple-system, 
                        BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", 
                        "Helvetica Neue", sans-serif; }
                        a { color: ${PRIMARY_COLOR}; text-decoration: none; }
                        p { line-height: 1.7; margin: 0 0 16px 0; color: ${TEXT_DARK}; text-align: justify; }
                        .container { background-color: #ffffff; max-width: 600px; margin: 20px auto; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08); }
                        .header { background-color: ${SUCCESS_COLOR}; /* Success Green */ color: #ffffff; padding: 35px 25px; text-align: center; }
                        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
                        .body { padding: 35px 30px; color: ${TEXT_DARK}; }
                        .footer { background-color: #1F2937; color: #9CA3AF; padding: 25px 30px; font-size: 12px; text-align: center; }
                        .button { display: inline-block; margin-top: 25px; background-color: ${PRIMARY_COLOR}; color: #ffffff !important; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                        .otp-box { background-color: #E0F2F1; border: 1px solid ${SUCCESS_COLOR}; padding: 15px 25px; margin: 25px auto; text-align: center; max-width: 300px; border-radius: 8px; }
                        .otp-code { font-size: 28px; font-weight: 700; color: ${SUCCESS_COLOR}; letter-spacing: 5px; margin: 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <!-- Header Section - Welcome Green -->
                        <div class="header">
                            <h1>&#127881; Welcome to InfoBeatLive!</h1>
                        </div>
                        
                        <!-- Main Content Body -->
                        <div class="body">
                            <p style="font-size: 16px;">Hi ${fullName || 'there'},</p>

                            <p style="font-size: 16px;">
                                Thank you for subscribing and joining the InfoBeatLive academy! 
                                We’re thrilled to have you on board.
                            </p>

                            <div style="text-align: center;">
                                <a href="${WEBSITE_LINK}" class="button">
                                    Go to InfoBeatLive
                                </a>
                            </div>

                            <p style="margin-top: 35px; font-size: 15px; color: #4B5563;">
                                Warm regards,<br />
                                The InfoBeatLive Team
                            </p>
                        </div>

                        <!-- Footer Section -->
                        <div class="footer">
                            <p style="color: #6B7280; font-size: 11px; margin: 0;">
                                &copy; ${new Date().getFullYear()} InfoBeatLive, All rights reserved.
                            </p>
                        </div>
                    </div>
                </body>
                </html>`,
        });

    } catch (error) {
        console.error('Resend email error:', error);
        throw new Error('Failed to send welcome/verification email via Resend');
    }
}


export  const createNotification = async (userId: string, title: string, description: string) => {
  const notification = await prisma.notification.create({
    data: { userId, title, description },
  });
  io.to(userId).emit('new-notification', notification);
};


function verifySignature(secret: string, payload: string, signature: string): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload, 'utf8');
  const digest = hmac.digest('hex');
  return digest === signature;
}

webhookRouter.post('/webhook',  express.raw({ type: 'application/json' }), async (req, res) => {

  try {
  
    const signature = req.headers['x-signature'] as string;
    if (!signature) {
      return res.status(400).send('Missing signature');
    }
    
    const rawBody = req.body.toString('utf8');
    const secret = process.env.LEMON_SQUEEZY_SIGNING_SECRET!;
 
    const isValid = verifySignature(secret, rawBody, signature);
    if (!isValid) {
      return res.status(400).send('Invalid signature');
    }
  
    const event = JSON.parse(rawBody);
    const eventType = event.meta?.event_name;
 
    if (eventType === 'subscription_payment_success') {
      const customData = event.meta?.custom_data;

      if (!customData) {
        console.warn('Missing custom_data in webhook');
        return res.status(400).send('Missing custom_data');
      }

      const amount = customData.amount ; 

      const durationInDays = customData.billing_cycle === "Monthly" ? 30 : customData.billing_cycle === "Yearly" ? 365 : null;

    if (customData.plan_type === 'Basic' || 'Plus' || 'Pro') {

     const existingSubscription = await prisma.subscription.findFirst({
         where:{userId: customData.user_id },
      });

    if (existingSubscription ) {
      await prisma.subscription.update({
           where: { id: existingSubscription.id },
           data: {
            planType: customData.plan_type,
            amount: amount,
            billingCycle:customData.billing_cycle,
            isActive:true,
            isSuspended:false,
            nextBillingDate: durationInDays ? new Date(Date.now() + durationInDays * 24 * 60 * 60 * 1000) : new Date(),
            lastPaymentDate: new Date(Date.now())
            },
         });

        await prisma.user.update({
              where: { id: customData.user_id,  },
              data: {
                planType: customData.plan_type,
                billingCycle:customData.billing_cycle,
                isActive:true,
                isSuspended:false,
                nextBillingDate: durationInDays ? new Date(Date.now() + durationInDays * 24 * 60 * 60 * 1000) : new Date(),
                lastPaymentDate: new Date(Date.now())
            },
            });

      }
 
       const user = await prisma.user.findUnique({
              where: { id: customData.user_id,  },
            });
       
       if(user){
         await prisma.invoice.create({
          data: { 
              userId: customData.user_id,
              name:user.fullName,
              invoiceId:'',
              amount: amount,
              status:'Paid',
              planType: customData.plan_type,
              billingCycle: customData.billing_cycle,
              nextBillingDate: durationInDays ? new Date(Date.now() + durationInDays * 24 * 60 * 60 * 1000) : new Date(), 
              isCompleted: true,
           },
           });
       } else { 
          await prisma.invoice.create({
          data: { 
              userId: customData.user_id,
              name:'Valued Customer',
              invoiceId:'',
              amount: amount,
              status:'Paid',
              planType: customData.plan_type,
              billingCycle: customData.billing_cycle,
              nextBillingDate: durationInDays ? new Date(Date.now() + durationInDays * 24 * 60 * 60 * 1000) : new Date(), 
              isCompleted: true,
           },
           });}

  
          await prisma.earning.create({
              data: {
                userId: customData.user_id,
                planType: customData.plan_type,
                billingCycle: customData.billing_cycle,
                nextBillingDate: durationInDays ? new Date(Date.now() + durationInDays * 24 * 60 * 60 * 1000) : new Date(), 
                status: 'Paid', 
                isCompleted: true, 
                amount: Number(amount),
              },
            });

            if (user) { 
               
            await sendResendOtp( user?.email,  user?.fullName, );
            
            await createNotification(
                      customData.user_id,
                      "InfoBeatLive Billing Alert",
                      `Thank you for subscribing and joining the InfoBeatLive 
                       academy!  We’re thrilled to have you on board.`
            );

            const existingResponse = await prisma.updateResponse.findFirst({
                 where:{userId: customData.user_id}
            });
            
            const dashboardsUpdate = new Date().toISOString();
              
            if(existingResponse){
                  await prisma.updateResponse.update({
               where:{id:existingResponse.id},
               data: {  
                 settingsUpdate:dashboardsUpdate, 
                 notificationUpdate:dashboardsUpdate }, });
            }
         

         }
      }

     } else if (eventType === 'subscription_payment_failed') {
        
        const customData = event.meta?.custom_data;
        
        if (!customData || !customData.user_id || !customData.plan_type) {
             console.warn('Subscription failure webhook missing custom_data or key fields.');
             return res.status(400).send('Missing required data for failure event.');
        }

        const user = await prisma.user.findUnique({ where: { id: customData.user_id } });

        if (user) {
           
            await sendSubscriptionFailureEmail(
                user.email,
                user.fullName || 'Valued Customer',
                customData.plan_type
            );

            
                await createNotification(
                      customData.user_id,
                      "Payment Failure Notice",
                      ` We are writing to urgently inform you that the payment for your 
                        InfoBeatLive ${customData.plan_type} subscription could not be processed.
                        to prevent a temporary suspension of your service. Please update your billing details.`
            );


        } else {
             console.warn(`User or Company not found for subscription failure event. User ID: ${customData.user_id}`);
        }
     } else {
      console.log("Unhandled webhook event:", eventType);
    }

    res.status(200).send('Webhook received');
   } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).send(`Internal error ${err}`);
  }

  });
 
export default webhookRouter;
