import { Request, Response, NextFunction } from "express";
import { z } from "zod";

export const createQuestionSchema = z.object({
  examSessionId: z.string().uuid("Invalid Exam Session UUID"),
  questionNumber: z.number().int().positive(),
  sectionTitle: z.string().optional(),
  questionType: z.enum(["MULTIPLE_CHOICE", "MULTIPLE_SELECT", "SHORT_INPUT", "ESSAY_LONG_TEXT", "CODE_EXECUTION"]),
  visualType: z.enum(["TEXT", "MARKDOWN", "CODE", "TABLE", "IMAGE"]).default("TEXT"),
  prompt: z.string().min(1, "Question prompt is required"),
  supplementaryData: z.record(z.any()).optional(),
  options: z.array(z.object({ label: z.string(), text: z.string() })).optional(),
  maxMarks: z.number().int().positive().default(1),
  rubric: z.record(z.any()).optional(),
  correctAnswer: z.string().optional()
});

export const updateQuestionSchema = createQuestionSchema.partial();

export const validateCreateQuestion = (req: Request, res: Response, next: NextFunction): void => {
  const result = createQuestionSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ success: false, errors: result.error.errors });
    return;
  }
  req.body = result.data;
  next();
};

export const validateUpdateQuestion = (req: Request, res: Response, next: NextFunction): void => {
  const result = updateQuestionSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ success: false, errors: result.error.errors });
    return;
  }
  req.body = result.data;
  next();
};