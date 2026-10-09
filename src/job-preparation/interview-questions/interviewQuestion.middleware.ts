import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const updateQuestionSchema = z.object({
  title: z.string().optional(),
  prompt: z.string().optional(),
  timeAllocationMins: z.number().int().optional(),
  codeStarterSnippet: z.string().nullable().optional(),
  codeLanguage: z.string().nullable().optional(),
  supplementaryData: z.any().optional(),
  rubricCriteria: z.any().optional(),
});

export const validateUpdateQuestion = (req: Request, res: Response, next: NextFunction) => {
  try {
    req.body = updateQuestionSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ status: 'error', errors: error.errors });
    }
    next(error);
  }
};