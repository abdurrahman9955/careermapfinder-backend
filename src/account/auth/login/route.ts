import express, { Request, Response } from 'express';
import argon2 from 'argon2';
import prisma from '../../../utils/prisma';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: '../../../../../backend/.env' });

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!); 

const loginRoutes = express.Router();

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
    jwt.sign({ id: userId }, JWT_REFRESH_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err || !token) {
        reject(err);
      } else {
        resolve(token);
      }
    });
  });
};


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
            We received a request to log in to your <strong>Infobeatlive</strong> account.
          </p>
          <p style="font-size: 18px; color: #000;">
            <strong>Your OTP code is:</strong>
          </p>
          <div style="font-size: 28px; font-weight: bold; color: #899719; margin: 16px 0;">
            ${otp}
          </div>
          <p style="font-size: 15px; color: #555;">
            This code is valid for the next <strong>60 seconds</strong>. Please use  it  to complete your login.
          </p>
          <hr style="margin: 24px 0;" />
          <p style="font-size: 13px; color: #888;">
            If you did not initiate this request, you can safely ignore this message. Do not share this OTP with anyone for security reasons.
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

loginRoutes.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password }: { email: string; password: string } = req.body;

    // Find the user by email
    const user = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    if (!user) {
      return res.status(401).json({success:false, error: 'Email not registered. Please create a new account.' });
    }


    const account = await prisma.account.findFirst({
      where: {
        userId: user.id,
      },
    });

    if (!account) {
      return res.status(401).json({success:false, error: 'Account not found. Please contact support.' });
    }

    if (account && !account.isVerified) {
        return res.status(401).json({success:false, error: 'User exist But account is not verified yet, go and signup to complete verification' });
      }
    


    // Verify the password
    const isPasswordValid = await argon2.verify(user.password as any, password);

    if (!isPasswordValid) {
      return res.status(401).json({success:false, error: 'Incorrect password. Please enter the correct password and try again.' });
    }

    // Generate OTP and expiration
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpiration = new Date(Date.now() + 60000); // 1 minute validity

    // Update OTP and tokens in the account model
    const accessToken = await generateAccessToken(user.id);
    const refreshToken = await generateRefreshToken(user.id);

    await prisma.account.update({
      where: {
        id: account.id,
      },
      data: {
        otp: otp.toString(),
        otpExpiration: otpExpiration,
        access_token: accessToken,
        refresh_token: refreshToken,
      },
    });

    // Send OTP via email
    await sendResendOtp(email, otp);

    return res.status(200).json({
      success:true,
      message: 'OTP sent successfully. Please verify your email to continue.',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({success:false, error: 'Internal Server Error' });
  }
});

export default loginRoutes;
