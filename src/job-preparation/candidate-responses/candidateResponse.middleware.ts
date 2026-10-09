import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const submitResponseSchema = z.object({
  questionId: z.string().uuid(),
  responseText: z.string().nullable().optional(),
  submittedCode: z.string().nullable().optional(),
  selectedChoices: z.array(z.string()).default([]),
  timeSpentSeconds: z.number().int().nonnegative().default(0),
});

export const validateSubmitResponse = (req: Request, res: Response, next: NextFunction) => {
  try {
    req.body = submitResponseSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ status: 'error', errors: error.errors });
    }
    next(error);
  }
};