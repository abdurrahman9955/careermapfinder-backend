import express, { Request, Response } from 'express';
import argon2 from 'argon2';
import prisma from '../../../utils/prisma';
import validator from 'validator';
import dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: '../../../../../backend/.env' });

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!); 

const resetPasswordRouter = express.Router();

async function sendResendOtp(email: string, otp: number): Promise<void> {
  try {
    await resend.emails.send({
      from: 'noreply@infobeatlive.com',
      to: email,
      subject: 'Your One-Time Password (OTP)',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f9f9f9;">
          <h2 style="color: #333;">Hello,</h2>
          <p style="font-size: 16px; color: #555;">
            We received a request for updating your <strong>Infobeatlive</strong> account password.
          </p>
          <p style="font-size: 18px; color: #000;">
            <strong>Your OTP code is:</strong>
          </p>
          <div style="font-size: 28px; font-weight: bold; color: #899719; margin: 16px 0;">
            ${otp}
          </div>
          <p style="font-size: 15px; color: #555;">
            This code is valid for the next <strong>60 seconds</strong>. 
            Please use  it  to update  your password.
          </p>
          <hr style="margin: 24px 0;" />
          <p style="font-size: 13px; color: #888;">
            If you did not initiate this request, you can safely ignore this message. 
            Do not share this OTP with anyone for security reasons.
          </p>
          <p style="font-size: 13px; color: #888;">
            Best Regards,<br/>
            The Infobeatlive Auth Team
          </p>
        </div>
      `,
    });

    console.log(`Resend: OTP email sent to ${email}`);
  } catch (error) {
    console.error('Resend email error:', error);
    throw new Error('Failed to send OTP via Resend');
  }
}

resetPasswordRouter.post('/update-password', async (req: Request, res: Response) => {
  try {
    const { email, newPassword }: { email: string; newPassword: string } = req.body;

    // Validate email input
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ error: 'Please provide a valid email.' });
    }

    // Validate new password
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'Please provide a valid password (at least 8 characters).' });
    }

    // Check if the user exists
    const user = await prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const account = await prisma.account.findFirst({
      where: { userId: user.id },
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found.' });
    }

   
    if (account && !account.isVerified) {
      return res.status(401).json({success:false, error: 'User exist But account is not verified yet, go and signup to complete verification' });
    }
 
    // Generate reset OTP and expiry
    const resetOtp = Math.floor(100000 + Math.random() * 900000);
    const resetOtpExpiry = new Date(Date.now() + 60000); // OTP valid for 60 seconds

    // Hash the new password
    const hashedPassword = await argon2.hash(newPassword);

    // Update the account with reset OTP, expiry, and hashed new password
    await prisma.account.update({
      where: { id: account.id },
      data: {
        otp: resetOtp.toString(),
        otpExpiration: resetOtpExpiry,
        tempPassword: hashedPassword,
      },
    });

    await sendResendOtp(email, resetOtp);

    return res.status(200).json({success:true, message: 'Reset OTP sent to your email.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({success:false, error: 'Something went wrong! Please try again.' });
  }
});

export default resetPasswordRouter;
