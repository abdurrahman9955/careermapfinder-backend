import { Request, Response, NextFunction } from "express";
import { z } from "zod";

export const generateReportSchema = z.object({
  examSessionId: z.string().uuid("Invalid Exam Session ID format")
});

export const updateReportSchema = z.object({
  totalMarksObtained: z.number().optional(),
  totalMaxMarks: z.number().optional(),
  percentage: z.number().optional(),
  grade: z.string().optional(),
  overallFeedback: z.string().optional(),
  strengths: z.array(z.string()).optional(),
  improvementAreas: z.array(z.string()).optional(),
  categoryBreakdown: z.array(z.record(z.any())).optional()
});

export const validateGenerateReport = (req: Request, res: Response, next: NextFunction): void => {
  const result = generateReportSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ success: false, errors: result.error.errors });
    return;
  }
  req.body = result.data;
  next();
};

export const validateUpdateReport = (req: Request, res: Response, next: NextFunction): void => {
  const result = updateReportSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ success: false, errors: result.error.errors });
    return;
  }
  req.body = result.data;
  next();
};