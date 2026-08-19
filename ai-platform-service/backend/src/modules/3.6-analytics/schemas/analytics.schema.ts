import { z } from "zod";

export const analyticsDailyQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD")
    .optional(),
});

export const analyticsDailyResponseSchema = z.object({
  date: z.string(),
  metrics: z.object({
    totalAiRuns: z.number(),
    totalCostUsd: z.number(),
    averageLatencyMs: z.number(),
  }),
});

export type AnalyticsDailyQuery = z.infer<
  typeof analyticsDailyQuerySchema
>;
