import { Router } from 'express';
import {
  createInterviewSession,
  getAllSessions,
  getSessionById,
  deleteSession,
  getSessionByUserId,
  updateSession,
  submitSession
} from './interviewSession.controller';
import { validateCreateInterviewSession } from './interviewSession.middleware';
import { authenticateUser } from "../../utils/authMiddleware";

const interviewSessionRouter = Router();

interviewSessionRouter.post('/interview-sessions/', authenticateUser, validateCreateInterviewSession, createInterviewSession);
interviewSessionRouter.get('/interview-sessions/', authenticateUser, getAllSessions);
interviewSessionRouter.get('/interview-sessions/:userId', authenticateUser, getSessionByUserId);
interviewSessionRouter.get('/interview-sessions/:id', authenticateUser, getSessionById);
interviewSessionRouter.patch('/interview-sessions/:id', authenticateUser, updateSession);
interviewSessionRouter.post('/interview-sessions/:id/submit', authenticateUser, submitSession);
interviewSessionRouter.delete('/interview-sessions/:id', authenticateUser, deleteSession);

export default interviewSessionRouter;