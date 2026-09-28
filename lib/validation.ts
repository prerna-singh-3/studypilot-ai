import { z } from "zod";

export const studyPlanInputSchema = z.object({
  subjects: z.array(z.string().min(1)).min(1),
  examDate: z.string().min(1),
  dailyHours: z.number().min(1).max(16),
  weakTopics: z.array(z.string().min(1)).min(1),
});

export type StudyPlanInput = z.infer<typeof studyPlanInputSchema>;