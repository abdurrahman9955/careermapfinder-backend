import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const createIntakeSchema = z.object({
  userId: z.string().optional(),
  language: z.string().default('English'),
  journeyStage: z.enum([
    'HIGH_SCHOOL',
    'UNDERGRADUATE',
    'RECENT_GRADUATE',
    'CAREER_SWITCHER',
  ]),
  targetRoleOrField: z.string().min(2),
  academicStream: z.enum([
    'PHYSICAL_NATURAL_SCIENCES',
    'ENGINEERING_TECHNOLOGY',
    'HEALTH_MEDICAL_SCIENCES',
    'COMMERCIAL_BUSINESS',
    'ARTS_LAW_HUMANITIES',
    'UNDECIDED_OPEN',
  ]),
  homeCountry: z.string().min(2),
  stateCity: z.string().min(2),
  targetStudyCountry: z.string().min(2),
  currentGradeLevel: z.string().optional(),
  currentSchoolName: z.string().optional(),
  keySubjectsMajor: z.string().min(2),
  estimatedGpaPerformance: z.string().min(1),
  preferredQualification: z.enum([
    'DIPLOMA',
    'BACHELORS',
    'MASTERS',
    'DOCTORATE_PHD',
    'PROFESSIONAL_CERTIFICATION',
    'FELLOWSHIP_SPECIALIZATION',
  ]),
  primaryPriority: z.enum([
    'HIGH_EARNING_POTENTIAL',
    'WORK_LIFE_BALANCE',
    'GLOBAL_MOBILITY_VISAS',
    'SOCIAL_IMPACT_PURPOSE',
    'HIGH_DEMAND_STABILITY',
    'CREATIVE_AUTONOMY',
  ]),
  preferredWorkEnv: z.enum(['REMOTE', 'HYBRID', 'ON_SITE', 'FLEXIBLE']),
  workIntensity: z.enum([
    'STANDARD_40H',
    'MODERATE_50H',
    'HIGH_INTENSITY_60H_PLUS',
  ]),
  personalBackground: z.string().min(10),
  specificQuestions: z.string().optional(),
});

export const updateIntakeSchema = createIntakeSchema.partial();

export const updateReportSchema = z.object({
  careerName: z.string().optional(),
  careerOverview: z.string().optional(),
  whatProfessionalDoes: z.string().optional(),
  whyChooseThisCareer: z.string().optional(),
  whoIsSuitableFor: z.string().optional(),
  requiredSkills: z.array(z.string()).optional(),
  importantSubjects: z.array(z.string()).optional(),
  startingSalaryRange: z.string().optional(),
  averageSalary: z.string().optional(),
  experiencedSalary: z.string().optional(),
  workLifeBalanceRating: z.number().min(1).max(10).optional(),
  jobSecurityRating: z.number().min(1).max(10).optional(),
});

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

export const validateCreateIntake = validate(createIntakeSchema, 'body');
export const validateUpdateIntake = validate(updateIntakeSchema, 'body');
export const validateUpdateReport = validate(updateReportSchema, 'body');
export const validateId = validate(z.object({ id: z.string() }), 'params');