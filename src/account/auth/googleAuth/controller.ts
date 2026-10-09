import { Request, Response } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from '../../../utils/prisma';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

const generateAccessToken = (userId: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) reject(err);
      else resolve(token!);
    });
  });
};

const generateRefreshToken = (userId: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    jwt.sign({ id: userId }, JWT_REFRESH_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) reject(err);
      else resolve(token!);
    });
  });
};

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const firstName = profile.name?.givenName || '';
        const lastName = profile.name?.familyName || '';

        if (!email) return done(new Error('Email not found'));

        let user = await prisma.user.findUnique({ where: { email } });
      
        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              fullName: firstName && lastName,
              password:'google password',
              planType:'Basic',
            },
          });

          await prisma.user.update({
            where: { id: user.id },
            data: {
               handle: '@' + user.fullName?.replace(/\s/g, '') + '/' + user.count,
            },
          });

          const tokenExpiration = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

          await prisma.account.create({
            data: {
              userId: user.id,
              provider: 'google',
              type: 'oauth',
              access_token: accessToken,
              refresh_token: refreshToken,
              handle: '@' + user.fullName?.replace(/\s/g, '') + '/' + user.count,
              isVerified: true,
              otp:'000000',
              otpExpiration: new Date(Date.now() + 60000), 
              emailVerified: new Date(),
              expires_at: tokenExpiration, 
       
            },
          });

          await prisma.updateResponse.create({ data: { userId: user.id}});
          await prisma.activity.create({ data: { userId: user.id}});

        }

        return done( null,  user );
      } catch (err) {
        return done(err as Error);
      }
    }
  )
);

passport.serializeUser((user: any, done) => done(null, user.id));

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export const googleCallback = async (req: Request, res: Response) => {
  try {

    const user = req.user as any;

    const accessToken = await generateAccessToken(user.id);
    const refreshToken = await generateRefreshToken(user.id);

    await prisma.account.update({
      where: { userId: user.id },
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
      },
    });

    res.cookie('accessToken', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', });

    res.redirect( `https://www.infobeatlive.com/google/auth/callback?accessToken=${accessToken}&userId=${user.id}` );

  } catch (error) {
    console.error('Google OAuth Callback Error:', error);
    res.redirect('https://www.careermapfinder.com/google/auth/error');
  }
};

