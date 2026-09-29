import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import prisma from '../../../utils/prisma';

dotenv.config();
dotenv.config({ path: '../../../../../backend/.env' });

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!); 

const routerOtpLogin = express.Router();

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

routerOtpLogin.post('/verifySignInOtp', async (req: Request, res: Response) => {
  try {
    const { email, otp }: { email: string; otp: string } = req.body;

    const user = await prisma.user.findFirst({
      where: { email, },
    });

    if (!user) {
      return res.status(404).json({success:false, error: 'User not found' });
    }

    const account = await prisma.account.findFirst({
      where: { userId: user.id,},
    });

    if (!account) {
      return res.status(404).json({success:false, error: 'Account not found' });
    }

    if (account.otp !== otp) {
      return res.status(400).json({success:false, error: 'Invalid OTP' });
    }

    if (account.otpExpiration && new Date(account.otpExpiration) < new Date()) {
      return res.status(400).json({success:false, error: 'OTP has expired' });
    }

    const accessToken = await generateAccessToken(user.id);
    const refreshToken = await generateRefreshToken(user.id);
    const tokenExpiration = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); 

    await prisma.account.update({
      where: {
        id: account.id,
      },
      data: {
        otp,
        otpExpiration: new Date(Date.now() + 60000), 
        access_token: accessToken,
        refresh_token: refreshToken,
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
    console.error(error);
    return res.status(500).json({success:false, error: 'Internal Server Error' });
  }
});

routerOtpLogin.post('/resend/SignInOtp', async (req, res) => {
  try {
    const { email }: { email: string } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(404).json({success:false, error: 'User not found' });
    }

    const account = await prisma.account.findFirst({
      where: {
        userId: user.id,
      },
    });

    if (!account) {
      return res.status(404).json({success:false, error: 'Account not found' });
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
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; 
        border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f9f9f9;">
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

export default routerOtpLogin;
