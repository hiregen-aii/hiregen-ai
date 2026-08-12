import { z } from 'zod';

export const FollowUpDecisionReason = z.enum([
  'LEAD_REPLIED',
  'LEAD_CONVERTED',
  'MAX_STEPS_EXCEEDED',
  'TOO_SOON_SINCE_LAST_EMAIL',
  'READY_FOR_FOLLOWUP',
  'LEAD_NOT_FOUND',
  'RESEARCH_MISSING',
  'CAMPAIGN_MISSING',
  'INTERNAL_ERROR'
]);

export type FollowUpDecisionReason = z.infer<typeof FollowUpDecisionReason>;

export const FollowUpJobSchema = z.object({
  lead_id: z.string().uuid(),
  campaign_id: z.string().uuid(),
  current_step: z.number().int().min(1),
  force_generation: z.boolean().optional(),
  max_steps: z.number().int().min(1).optional(),
  days_between_followups: z.number().int().min(1).optional()
});

export type FollowUpJob = z.infer<typeof FollowUpJobSchema>;

export const FollowUpDecisionSchema = z.object({
  lead_id: z.string(),
  should_generate: z.boolean(),
  reason: FollowUpDecisionReason,
  next_step: z.number().optional(),
  personalization_job: z.any().optional(), // We use any or a base type as a placeholder for the integration contract
  explanation: z.string().optional(),
  evaluated_at: z.date().optional()
});

export type FollowUpDecision = z.infer<typeof FollowUpDecisionSchema>;

export const FollowUpContextSchema = z.object({
  lead: z.object({
    id: z.string(),
    stage: z.string(),
    hiring_type: z.string().optional(),
    urgency: z.string().optional(),
    fit_score: z.number().optional(),
    primary_contact_id: z.string().optional(),
    company_id: z.string().optional()
  }),
  campaign: z.object({
    id: z.string()
  }),
  followUpHistory: z.object({
    total_sent: z.number(),
    last_sent_at: z.date().optional(),
    days_since_last: z.number(),
    has_replied: z.boolean(),
    last_reply_at: z.date().optional(),
    steps_sent: z.array(z.number())
  }),
  timing: z.object({
    should_generate: z.boolean(),
    next_step: z.number(),
    days_since_last: z.number(),
    min_days_between: z.number(),
    max_steps: z.number(),
    days_until_ready: z.number().optional()
  }),
  research: z.object({
    summary: z.string(),
    source_urls: z.array(z.string())
  }).optional(),
  company_memory: z.any().optional()
});

export type FollowUpContext = z.infer<typeof FollowUpContextSchema>;
