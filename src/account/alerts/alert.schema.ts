import { z } from 'zod';

export const AlertCategoryEnum = z.enum(['STUDENT', 'EXAM_CANDIDATE', 'JOB_SEEKER']);
export const AlertFrequencyEnum = z.enum(['DAILY', 'WEEKLY', 'MILESTONE_DRIVEN']);
export const PreferredChannelEnum = z.enum(['EMAIL', 'WHATSAPP', 'IN_APP_PUSH']);
export const RegistrationStatusEnum = z.enum(['REGISTERED', 'PREPARING_TO_REGISTER', 'AWAITING_RESULTS']);

export const CreateAlertSchema = z.object({
  userId: z.string().uuid('Invalid User ID format'),
  language: z.string().min(2).default('en'),
  category: AlertCategoryEnum,
  targetGoalName: z.string().min(1, 'Target goal name is required'),
  targetDate: z.string().datetime({ message: 'Must be a valid ISO DateTime string' }).or(z.date()),
  preferredFrequency: AlertFrequencyEnum,
  notificationChannel: PreferredChannelEnum,
  contactEmail: z.string().email('Invalid email address'),
  
  contactPhone: z.string().optional(),
  academicStream: z.string().optional(),
  targetMajorOrDegree: z.string().optional(),
  currentWeeklyStudyHours: z.number().int().positive().optional(),
  weakestSubjects: z.array(z.string()).default([]),
  examName: z.string().optional(),
  
  examRegistrationStatus: RegistrationStatusEnum.optional(),
  targetScoreGoal: z.string().optional(),
  priorityTopics: z.array(z.string()).default([]),
  targetRoleTitle: z.string().optional(),
  targetCompaniesCount: z.number().int().positive().optional(),
  weeklyApplicationGoal: z.number().int().positive().optional(),
  
  focusInterviewSkill: z.array(z.string()).default([]),
  dailyCommitmentMinutes: z.number().int().positive(),
  preferredAlertTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:mm 24-hour format'),
  autoPauseOnInactivity: z.boolean().default(true),
  additionalContextNotes: z.string().optional(),
});

export const UpdateAlertSchema = CreateAlertSchema.partial();

export const SubmitResponseSchema = z.object({
  alertId: z.string().uuid('Invalid Alert ID'),
  description: z.string().min(1, 'Response description is required'),
});

export type CreateAlertInput = z.infer<typeof CreateAlertSchema>;
export type UpdateAlertInput = z.infer<typeof UpdateAlertSchema>;
export type SubmitResponseInput = z.infer<typeof SubmitResponseSchema>;