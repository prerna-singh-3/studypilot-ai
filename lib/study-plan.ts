import { z } from "zod";

export const studyPlanSchema = z.object({
  summary: z.string().min(1),
  days: z
    .array(
      z.object({
        day: z.string().min(1),
        focus: z.string().min(1),
        tasks: z.array(z.string().min(1)).min(1),
      })
    )
    .min(1)
    .max(14),
});

export type StudyPlan = z.infer<typeof studyPlanSchema>;