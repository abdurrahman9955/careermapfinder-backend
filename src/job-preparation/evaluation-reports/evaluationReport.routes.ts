import { Router } from 'express';
import {
  generateEvaluationReport,
  getAllEvaluationReports,
  getEvaluationReportById,
  getEvaluationReportBySessionId,
  updateEvaluationReport,
  deleteEvaluationReport,
} from './evaluationReport.controller';
import {
  validateGenerateReport,
  validateUpdateReport,
  validateIdParam,
  validateSessionIdParam,
} from './evaluationReport.middleware';
import { authenticateUser } from "../../utils/authMiddleware";

const interviewReportsRouter = Router();

// CREATE / GENERATE
interviewReportsRouter.post('/interview-reports/generate', authenticateUser, validateGenerateReport, generateEvaluationReport);

// READ ALL
interviewReportsRouter.get('/interview-reports', authenticateUser, getAllEvaluationReports);

// READ BY ID
interviewReportsRouter.get('/interview-reports/:id', authenticateUser, validateIdParam, getEvaluationReportById);

// READ BY SESSION ID
interviewReportsRouter.get('/interview-reports/session/:sessionId', authenticateUser, validateSessionIdParam, getEvaluationReportBySessionId);

// UPDATE BY ID
interviewReportsRouter.patch('/interview-reports/:id', authenticateUser, validateIdParam, validateUpdateReport, updateEvaluationReport);

// DELETE BY ID
interviewReportsRouter.delete('/interview-reports/:id', authenticateUser, validateIdParam, deleteEvaluationReport);

export default interviewReportsRouter;