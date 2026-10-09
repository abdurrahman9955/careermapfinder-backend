import { Router } from 'express';
import {
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  getQuestionBySessionId
} from './interviewQuestion.controller';
import { validateUpdateQuestion } from './interviewQuestion.middleware';
import { authenticateUser } from "../../utils/authMiddleware";

const interviewQuestionsRouter = Router();

interviewQuestionsRouter.get('/interview-questions/:interviewSessionId', authenticateUser, getQuestionBySessionId);
interviewQuestionsRouter.get('/interview-questions/:id', authenticateUser, getQuestionById);
interviewQuestionsRouter.patch('/interview-questions/:id', authenticateUser, validateUpdateQuestion, updateQuestion);
interviewQuestionsRouter.delete('/interview-questions/:id', authenticateUser, deleteQuestion);

export default interviewQuestionsRouter;