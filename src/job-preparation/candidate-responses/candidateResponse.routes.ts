import { Router } from 'express';
import {
  submitResponse,
  getResponseById,
  updateResponse,
  deleteResponse,
  getResponseByQuestionId
} from './candidateResponse.controller';
import { validateSubmitResponse } from './candidateResponse.middleware';
import { authenticateUser } from "../../utils/authMiddleware";

const interviewResponseRouter = Router();

interviewResponseRouter.post('/interview-responses', authenticateUser, validateSubmitResponse, submitResponse);
interviewResponseRouter.get('/interview-responses/:questionId', authenticateUser, getResponseByQuestionId);
interviewResponseRouter.get('/interview-responses/:id', authenticateUser, getResponseById);
interviewResponseRouter.patch('/interview-responses/:id', authenticateUser, updateResponse);
interviewResponseRouter.delete('/interview-responses/:id', authenticateUser, deleteResponse);

export default interviewResponseRouter;