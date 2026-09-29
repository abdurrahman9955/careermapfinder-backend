import express, { Request, Response } from 'express';
import prisma from '../../../utils/prisma';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: '../../../../../backend/.env' });

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!); 

const routerOtpReset = express.Router();

const JWT_SECRET = process.env.JWT_SECRET!;

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

const generateAccessToken = (userId: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err || !token) {
        reject(err);
      } else {
        resolve(token);
      }
    });
  });
};

const generateRefreshToken = (userId: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    jwt.sign({ id: userId }, JWT_REFRESH_SECRET, { expiresIn: '30d' }, (err, token) => {
      if (err || !token) {
        reject(err);
      } else {
        resolve(token);
      }
    });
  });
};

routerOtpReset.post('/verifyUpdatePasswordOtp', async (req:Request, res:Response) => {
  try {
    const { email, otp } = req.body;

    if (!email) {
      return res.status(400).json({ success:false, error: 'Please provide a valid email.' });
    }
    if (!otp || otp.toString().length !== 6) {
      return res.status(400).json({ success:false, error: 'Please provide a valid OTP.' });
    }

    const user = await prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ success:false, error: 'User not found.' });
    }

    const account = await prisma.account.findFirst({
      where: { userId: user.id },
    });

    if (!account) {
      return res.status(404).json({ success:false, error: 'Account not found.' });
    }

    if (account.otp !== otp) {
      return res.status(400).json({ success:false, error: 'Invalid OTP.' });
    }

    if (account.otpExpiration && new Date(account.otpExpiration) < new Date()) {
      return res.status(400).json({ success:false, error: 'OTP has expired.' });
    }

    if (!account.tempPassword) {
      return res.status(400).json({ success:false, error: 'Temporary password not found. Please reset again.' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { password: account.tempPassword },
    });

    const resetToken = uuidv4();  
    const resetTokenExpiry = Date.now() + 60000;

    const accessToken = await generateAccessToken(user.id); 
    const refreshToken = await generateRefreshToken(user.id);
    const tokenExpiration = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); 

    await prisma.account.update({
      where: {
        id: account.id,
      },
      data: {
        otp: otp,
        otpExpiration: new Date(Date.now() + 60000), 
        access_token: accessToken,
        refresh_token: refreshToken,
        resetToken,
        resetTokenExpiry: new Date(resetTokenExpiry),
        tempPassword: Date.now().toString(),
        expires_at: tokenExpiration, 
      },
    });

     return res.status(200).json({
      success:true,
      message: 'OTP verified successfully',
      accessToken,
      userId: user.id,
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({ success:false, error: 'Internal Server Error.' });
  }
});

routerOtpReset.post('/resendUpdatePasswordOtp', async (req:Request, res:Response) => {
  try {
    const { email }: { email: string } = req.body;

    if (!email) {
      return res.status(400).json({ success:false, error: 'Please provide a valid email.' });
    }

    const user = await prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ success:false, error: 'User not found.' });
    }

    const account = await prisma.account.findFirst({
      where: { userId: user.id },
    });

    if (!account) {
      return res.status(404).json({ success:false, error: 'Account not found.' });
    }

    if (!account.tempPassword) {
      return res.status(400).json({ success:false, error: 'Temporary password not found. Please reset again.' });
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.account.update({
      where: {
        id: account.id,
      },
      data: {
        otp: newOtp.toString(),
        otpExpiration: new Date(Date.now() + 60000), 
      },
    });

    await sendResendOtp(email, newOtp as any);
  
    return res.status(200).json({
      success:true,
      message: 'OTP resent successfully',
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success:false, error: 'Internal Server Error' });
  }
});

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

export default routerOtpReset;
