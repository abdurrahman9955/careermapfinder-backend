import { Request, Response, NextFunction } from "express";
import { z } from "zod";

export const createExamSessionSchema = z.object({
  userId: z.string().uuid("Invalid User ID UUID format"),
  language: z.string().min(2).default("en"),
  category: z.enum(["ACADEMIC", "PROFESSIONAL"]),
  format: z.enum(["OBJECTIVE_ONLY", "THEORY_ONLY", "HYBRID", "PRACTICAL_CODING"]).default("HYBRID"),
  country: z.string().optional(),
  state: z.string().optional(),
  examName: z.string().optional(),
  stream: z.string().optional(),
  subject: z.string().min(1, "Subject is required"),
  targetProgram: z.string().optional(),
  targetCareer: z.string().optional(),
  primaryObjective: z.string().optional(),
  industry: z.string().optional(),
  certVendor: z.string().optional(),
  examDescription: z.string().optional(),
  academicBackground: z.string().optional(),
  difficulty: z.enum(["FOUNDATIONAL", "STANDARD", "HIGH_DISTINCTION"]),
  targetScore: z.number().int().positive(),
  timeLimitMinutes: z.number().int().positive().default(60),
  questionCountOverride: z.number().int().positive().optional()
});

export const updateExamSessionSchema = createExamSessionSchema.partial().extend({
  status: z.enum(["GENERATED", "IN_PROGRESS", "SUBMITTED", "EVALUATED"]).optional(),
  startedAt: z.string().datetime().optional(),
  submittedAt: z.string().datetime().optional()
});

export const validateCreateSession = (req: Request, res: Response, next: NextFunction): void => {
  const result = createExamSessionSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ success: false, errors: result.error.errors });
    return;
  }
  req.body = result.data;
  next();
};

export const validateUpdateSession = (req: Request, res: Response, next: NextFunction): void => {
  const result = updateExamSessionSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ success: false, errors: result.error.errors });
    return;
  }
  req.body = result.data;
  next();
};