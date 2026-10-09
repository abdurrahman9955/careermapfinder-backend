import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// Schema for generating/creating a report via AI
export const generateReportSchema = z.object({
  interviewSessionId: z.string().uuid(),
});

// Schema for updating an existing evaluation report manually
export const updateReportSchema = z.object({
  overallScore: z.number().min(0).max(100).optional(),
  hireRecommendation: z
    .enum(['Strong Hire', 'Lean Hire', 'Lean No Hire', 'No Hire'])
    .optional(),
  executiveSummary: z.string().optional(),
  radarMetrics: z
    .object({
      technicalProficiency: z.number().min(0).max(100).optional(),
      communicationClarity: z.number().min(0).max(100).optional(),
      problemSolvingLogic: z.number().min(0).max(100).optional(),
      cultureAndLeadership: z.number().min(0).max(100).optional(),
      domainKnowledge: z.number().min(0).max(100).optional(),
    })
    .optional(),
  strengths: z.array(z.string()).optional(),
  weaknesses: z.array(z.string()).optional(),
  keyImprovementAreas: z.array(z.string()).optional(),
  categoryBreakdowns: z
    .array(
      z.object({
        category: z.string(),
        categoryName: z.string(),
        score: z.number(),
        status: z.enum(['EXCELLENT', 'GOOD', 'NEEDS_WORK']),
      })
    )
    .optional(),
});

// Schema for URL UUID path parameters
export const idParamSchema = z.object({
  id: z.string().uuid(),
});

export const sessionIdParamSchema = z.object({
  sessionId: z.string().uuid(),
});

// Generic validation handler function
const validate =
  (schema: z.ZodSchema, source: 'body' | 'params' | 'query' = 'body') =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      req[source] = schema.parse(req[source]);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ status: 'error', errors: error.errors });
      }
      next(error);
    }
  };

export const validateGenerateReport = validate(generateReportSchema, 'body');
export const validateUpdateReport = validate(updateReportSchema, 'body');
export const validateIdParam = validate(idParamSchema, 'params');
export const validateSessionIdParam = validate(sessionIdParamSchema, 'params');