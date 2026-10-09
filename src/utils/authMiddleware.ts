import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import prisma from './prisma';

dotenv.config();

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
      email: string;
      fullName?: string;
    };
  }
}

const JWT_SECRET = process.env.JWT_SECRET!;

export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
 
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success:false, error: 'Unauthorized: invalid request type.' });
  }

  const token = authHeader.split(' ')[1]; 

  if (!token) {
    return res.status(401).json({ success:false, error: 'Unauthorized: access not found.' });
  }

  try {
    
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string }; 

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        fullName: true,
      },
    });

    if (!user) {
      return res.status(401).json({ success:false, error: 'Unauthorized: User does not exists.' });
    }

    req.user = user;
    next(); 
  } catch (error: any) {
    console.error('JWT authentication error:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success:false, error: 'Unauthorized: Token expired.' });
    }
    return res.status(401).json({ success:false, error: 'Unauthorized: Invalid token.' });
  }
};

// export const authorizeRoles = async () => { 
 
//    return async (req: Request, res: Response, next: NextFunction) => {
//     if (!req.user) {
      
//       return res.status(403).json({ success:false, error: 'Forbidden: User not authenticated.' });
//     }

//        const userCompany = await prisma.userCompany.findUnique({
//          where: { userId_companyId: { userId: req.user.id, companyId: req.body.companyId || req.params.companyId } }
//        });


//        const executive = userCompany?.roleInCompany.includes('EXECUTIVE');
//        const admin = userCompany?.roleInCompany.includes('ADMIN');
//        const viewer = userCompany?.roleInCompany.includes('VIEWER');

//     if (userCompany && executive  || admin  || viewer ){
//       next();
//     } else if (userCompany?.roleInCompany.includes('EMPLOYEE')) {
//       next();
//     } else {
//       return res.status(403).json({ success:false, error: 'Forbidden: Insufficient role permissions.' });
//     }

//     next(); 
//   };
// };
