import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const careerStageEnum = z.enum([
  'STUDENT_INTERN',
  'RECENT_GRADUATE',
  'ENTRY_LEVEL',
  'MID_LEVEL',
  'SENIOR',
  'STAFF_PRINCIPAL',
  'EXECUTIVE',
]);

const workArrangementEnum = z.enum([
  'REMOTE',
  'HYBRID',
  'ON_SITE',
  'OPEN_TO_RELOCATION',
]);

const interviewerStyleEnum = z.enum([
  'SUPPORTIVE_COACH',
  'STRICT_TECH_LEAD',
  'TOP_TECH_ASSESSOR',
  'TALENT_ACQUISITION',
]);

const questionCategoryEnum = z.enum([
  'TECHNICAL_LIVE_CODING',
  'SYSTEM_DESIGN_ARCHITECTURE',
  'BEHAVIORAL_STAR',
  'DOMAIN_SPECIFIC',
  'CASE_STUDY_PROBLEM_SOLVING',
  'HR_RECRUITER_SCREENING',
]);

export const createInterviewSessionSchema = z.object({
  language: z.string().min(2).default('English'),
  targetJobTitle: z.string().min(2),
  industryDomain: z.string().min(2),
  careerStage: careerStageEnum,
  workArrangement: z.array(workArrangementEnum).nonempty(),
  targetCountries: z.array(z.string()).nonempty(),
  isExperienced: z.boolean().default(true),
  highestDegree: z.string().min(2),
  institution: z.string().optional(),
  mostRecentEmployer: z.string().optional(),
  yearsOfExperience: z.number().int().min(0).default(0),
  currentJobTitle: z.string().optional(),
  coreSkills: z.array(z.string()).nonempty(),
  summaryOfAchievements: z.string().min(10),
  selectedCategories: z.array(questionCategoryEnum).nonempty(),
  interviewerStyle: interviewerStyleEnum,
  estimatedDurationMins: z.number().int().positive().default(30),
  jobDescription: z.string().min(20),
});

export const validateCreateInterviewSession = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body = createInterviewSessionSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ status: 'error', errors: error.errors });
    }
    next(error);
  }
};