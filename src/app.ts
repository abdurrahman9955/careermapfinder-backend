// src/app.ts
import express from 'express';
import { createServer, ServerOptions } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import passport from 'passport';

import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import session from 'express-session';

import dotenv from 'dotenv';
dotenv.config();
dotenv.config({ path: '../../backend/.env' });

import registerRoutes from './account/auth/register/route';
import loginRoutes from './account/auth/login/route';

import resetPasswordRouter from './account/auth/forgotPassword/route';
import logoutRoute from './account/auth/logout/logout';
import routerOtpVerification from './account/auth/verify/verifyRegister';

import routerOtpLogin from './account/auth/verify/verifyLogin';
import routerOtpReset from './account/auth/verify/verifyResetPassword';
import getCurrentUser from './account/auth/getUserDetails/UserDetails';

import contactRouter from './account/contact/contactRoute';

import googleRouter from './account/auth/googleAuth/google';
import routerHealth from './health/health';
import paymentRouter from './account/payment/payment';

import earningRouter from './account/earning/earn';
import notificationRouter from './account/notification/routes';

import subscriptionRouter from './account/payment/subscription/routes';
import invoiceRouter from './account/payment/invoice/routes';

import feedbackRouter from './account/feedback/feedbackRoute';
import counselingRouter from './account/counseling/counselingRoute';

import careerExplorerRouter from './career-explorer/careerExplorer.routes';
import assessmentQuestionRouter from './assessments/exam-question/exam-question.routes';
import assessmentReportRouter from './assessments/evaluation-report/evaluation-report.routes';

import assessmentResponseRouter from './assessments/user-response/user-response.routes';
import assessmentSessionRouter from './assessments/exam-session/exam-session.routes';
import interviewQuestionsRouter from './job-preparation/interview-questions/interviewQuestion.routes';

import interviewResponseRouter from './job-preparation/candidate-responses/candidateResponse.routes';
import interviewReportsRouter from './job-preparation/evaluation-reports/evaluationReport.routes';
import interviewSessionRouter from './job-preparation/interview-sessions/interviewSession.routes';

import alertRoutes from './account/alerts/alert.routes';
import { CronService } from './account/alerts/cron.service';
import updateResponseRouter from './account/update-responses/routes';
import pdfRouter from './utils/generate-pdf/pdfRoutes';
import helmet from "helmet";
import webhookRouter from './account/payment/webhook';
import prisma from './utils/prisma';

// import { createAdapter } from '@socket.io/redis-adapter';
// import { createClient } from 'redis';
// import {RedisStore} from "connect-redis";

import { startCronJobs } from './account/payment/cronJobs';


const app = express();

app.use((req, res, next) => {
 
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Content-Security-Policy", "frame-ancestors 'self';");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "no-referrer-when-downgrade");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  next();
});

app.use(
  helmet({
    frameguard: { action: "sameorigin" },
    contentSecurityPolicy: false, 
  })
);

app.use('/api/account/payment', webhookRouter);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin === 'https://www.careermapfinder.com' || origin === 'https://careermapfinder.com/' || origin === 'http://localhost:3000') {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
  } else {
    next();
  }
});

app.use(morgan('combined'));
app.use(cookieParser());

// const redisHost = 'localhost' 

// const pubClient = createClient({ url:`redis://${redisHost}:6379` });
// const subClient = pubClient.duplicate();

// const redisClient = createClient({ url:`redis://${redisHost}:6379`});
// redisClient.connect().catch(console.error);

// const sessionStore = new RedisStore({
//   client: redisClient,
//   prefix: "session:", 
// });

app.use(
  session({
    //store: sessionStore, 
    secret: process.env.SESSION_SECRET! as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
      sameSite: "none",
      secure: process.env.NODE_ENV === "production", 
      httpOnly: true,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

prisma
  .$connect()
  .then(() => {
    console.log('Connected to the database');
  })
  .catch((err: any) => {
    console.error('Error connecting to the database', err);
  });

const server = createServer(app);
export const io = new SocketIOServer(server, {
  cors: {
    origin: '*', 
  },
});

app.use('/api/health', routerHealth);
app.use('/api/account/auth/register', registerRoutes);
app.use('/api/account/auth/login', loginRoutes);
app.use('/api/account/update-responses', updateResponseRouter);

app.use('/api/account/auth/forgotPassword', resetPasswordRouter);
app.use('/api/account/auth/verify', routerOtpVerification);
app.use('/api/account/auth/verify', routerOtpLogin);

app.use('/api/account/auth/verify', routerOtpReset);
app.use('/api/account/auth/getUserDetails', getCurrentUser);
app.use('/api/account/auth/googleAuth', googleRouter);

app.use('/api/account/contact', contactRouter);
app.use('/api/account/payment', paymentRouter);

app.use('/api/account/counseling', counselingRouter);
app.use('/api/account/feedback', feedbackRouter);
app.use('/api/account/earning', earningRouter);
app.use('/api/account/notification', notificationRouter);

app.use('/api/account/subscription', subscriptionRouter);
app.use('/api/account/invoice', invoiceRouter);
app.use('/api/account/generate-pdf', pdfRouter);

app.use('/api/assessment/evaluation-report', assessmentQuestionRouter);
app.use('/api/assessment/exam-question', assessmentReportRouter);
app.use('/api/assessment/exam-session', assessmentResponseRouter);
app.use('/api/assessment/user-response', assessmentSessionRouter);

app.use('/api/career-explorer', careerExplorerRouter);

app.use('/api/job-preparation/candidate-responses', interviewResponseRouter);
app.use('/api/job-preparation/evaluation-reports', interviewReportsRouter);
app.use('/api/job-preparation/interview-questions', interviewQuestionsRouter);
app.use('/api/job-preparation/interview-sessions', interviewSessionRouter);

app.use('/api/account/alerts', alertRoutes);
app.use('/api/account/auth/logout', logoutRoute);


// Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
//   io.adapter(createAdapter(pubClient, subClient));
// });

interface UsersRoom {
  roomId?: string;
  userId: string;
}

const usersRoom = new Map<string, UsersRoom>();

io.on('connection', (socket:Socket) => {
  console.log('New user connected:', socket.id);


  socket.on('join-user', ({  userId }: {  userId: string }) => {

    const roomId = `user-${userId}`;

    usersRoom.set(socket.id, { roomId  } as any);
    console.log(`User  joined : ${roomId}`);
    socket.join(roomId);
    io.to(roomId).emit('user-joined', {  roomId });
  });

  socket.on('join-ai-chats', ({mainChatId, userId }: {mainChatId: string; userId: string }) => {

    const roomId = `main-chat-id-${mainChatId}`;

    usersRoom.set(socket.id, { roomId, userId });
    console.log(`User ${userId} joined room: ${roomId}`);
    socket.join(roomId);
    io.to(roomId).emit('user-joined', { userId, roomId });
  });

  socket.on('join-ticket-chats', ({ticketId, userId }: { ticketId: string; userId: string }) => {

    const roomId = `ticket-id-${ ticketId}`;

    usersRoom.set(socket.id, { roomId, userId });
    console.log(`User ${userId} joined room: ${roomId}`);
    socket.join(roomId);
    io.to(roomId).emit('user-joined', { userId, roomId });
  });

  socket.on('disconnect', () => {
    const user = usersRoom.get(socket.id);
    if (user?.roomId) {
      io.to(user.roomId).emit('user-left', { userId: user.userId, roomId: user.roomId });
    }
    usersRoom.delete(socket.id);
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT!;
server.listen(PORT, '0.0.0.0' as any, () => {
  console.log(`Server is running on port ${PORT}`);
  startCronJobs();
  CronService.initScheduler();
});

process.on('SIGINT', async () => {
  try {
    await prisma.$disconnect();
  } catch (err) {
    console.error('Error disconnecting Prisma:', err);
  } finally {
    process.exit();
  }
});

