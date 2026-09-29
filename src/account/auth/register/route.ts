import express, { Request, Response } from 'express';
import argon2 from 'argon2';
import prisma from '../../../utils/prisma';
import validator from 'validator';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!); 

const registerRoutes = express.Router();

async function sendResendOtp(email: string, otp: number): Promise<void> {
  try {
    await resend.emails.send({
      from: 'noreply@infobeatlive.com',
      to: email,
      subject: 'Your One-Time Password (OTP)',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; 
        padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f9f9f9;">
          <h2 style="color: #333;">Hello,</h2>
          <p style="font-size: 16px; color: #555;">
            We received a request for creating new <strong>Infobeatlive</strong> account.
          </p>
          <p style="font-size: 18px; color: #000;">
            <strong>Your OTP code is:</strong>
          </p>
          <div style="font-size: 28px; font-weight: bold; color: #899719; margin: 16px 0;">
            ${otp}
          </div>
          <p style="font-size: 15px; color: #555;">
            This code is valid for the next <strong>60 seconds</strong>. Please use  it  to complete your registration.
          </p>
          <hr style="margin: 24px 0;" />
          <p style="font-size: 13px; color: #888;">
            If you did not initiate this request, you can safely ignore this message. Do not share this 
            OTP with anyone for security reasons.
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

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

type GenerateToken = (userId: string) => Promise<string>;

const generateAccessToken: GenerateToken = (userId) => {
  return new Promise((resolve, reject) => {
    jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) {
        reject(err);
      } else {
        resolve(token!);
      }
    });
  });
};

const generateRefreshToken: GenerateToken = (userId) => {
  return new Promise((resolve, reject) => {
    jwt.sign({ id: userId }, JWT_REFRESH_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) {
        reject(err);
      } else {
        resolve(token!);
      }
    });
  });
};

registerRoutes.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, fullName, password } = req.body;

    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ error: 'Please provide a valid email' });
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Please provide a valid password' });
    }

    const existingUser = await prisma.user.findFirst({
      where: { email },
    });

    if (existingUser) {
      const account = await prisma.account.findFirst({
        where: { userId: existingUser.id },
      });

      if (account && !account.isVerified) {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
             email,
             fullName,
             password: password ? await argon2.hash(password) : existingUser.password,
          },
        });

        const otp = Math.floor(100000 + Math.random() * 900000);

        setTimeout(() => {
          console.log(`OTP expired for ${email}: ${otp}`);
        }, 60000);

        const accessToken = await generateAccessToken(existingUser.id );
        const refreshToken = await generateRefreshToken(existingUser.id );

        await prisma.account.update({
          where: { id: account.id },
          data: {
            otp: otp.toString(),
            otpExpiration: new Date(Date.now() + 60000),
            access_token: accessToken,
            refresh_token: refreshToken,
          },
        });

        await sendResendOtp(email, otp);

        return res.status(201).json({success:true, message: 'User updated and OTP sent' });
      }

      return res.status(401).json({success:false, error: 'User already exists and is already verified or inactive' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);

    setTimeout(() => {
      console.log(`OTP expired for ${email}: ${otp}`);
    }, 60000);

    const hashedPassword = await argon2.hash(password);

    const newUser = await prisma.user.create({
      data: {
        email,
        fullName,
        password: hashedPassword,
      },
    });

    const accessToken = await generateAccessToken(newUser.id);
    const refreshToken = await generateRefreshToken(newUser.id);

    await prisma.account.create({
      data: {
        userId: newUser.id,
        type: 'credentials',
        provider: 'local',
        handle: '@' + newUser.fullName?.replace(/\s/g, '') + '/' + newUser.count,
        access_token: accessToken,
        refresh_token: refreshToken,
        otp: otp.toString(),
        otpExpiration: new Date(Date.now() + 60000),
        isVerified: false,
      },
    }); 


       await prisma.updateResponse.create({ data: { userId: newUser.id}});
       await prisma.activity.create({ data: { userId: newUser.id}});

       await sendResendOtp(email, otp);

      return res.status(201).json({
      success:true,
      message: 'User registered successfully. Please verify your email.',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success:false, error:'Something went wrong! Please try again' });
  }
});

export default registerRoutes;
