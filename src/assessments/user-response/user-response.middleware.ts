import { Request, Response, NextFunction } from "express";
import { z } from "zod";

export const createUserResponseSchema = z.object({
  questionId: z.string().uuid("Invalid Question ID UUID"),
  answerText: z.string().optional(),
  selectedOptions: z.array(z.string()).default([]),
  timeSpentSeconds: z.number().int().nonnegative().default(0)
});

export const updateUserResponseSchema = createUserResponseSchema.partial();

export const validateCreateUserResponse = (req: Request, res: Response, next: NextFunction): void => {
  const result = createUserResponseSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ success: false, errors: result.error.errors });
    return;
  }
  req.body = result.data;
  next();
};

export const validateUpdateUserResponse = (req: Request, res: Response, next: NextFunction): void => {
  const result = updateUserResponseSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ success: false, errors: result.error.errors });
    return;
  }
  req.body = result.data;
  next();
};