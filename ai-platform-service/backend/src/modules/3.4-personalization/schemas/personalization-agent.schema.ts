/**
 * Schemas for the Personalization Agent runtime contract.
 * These sit on top of the template library and make the Phase-4 agent safe
 * to wire into queues / AI Gateway / approval_queue persistence.
 */
import { z } from "zod";
import { HiringType } from "./template.schema.js";

export const PersonalizationJob = z.object({
  lead_id: z.string().uuid(),
  company_id: z.string().uuid(),
  hiring_type: HiringType,
  step_number: z.number().int().min(1).default(1),
  role_title: z.string().min(1).default("hiring"),
  urgency: z.string().min(1).default("MEDIUM"),
  fit_score: z.number().min(0).max(100).default(0),
  contact_name: z.string().min(1),
  contact_title: z.string().min(1).optional(),
  company_name: z.string().min(1),
  sender_name: z.string().min(1),
  sender_title: z.string().min(1).optional(),
  calendar_link: z.string().min(1).optional(),
  research_summary: z.string().min(1),
  company_memory_json: z.unknown().optional().default({}),
  campaign_value_props: z.union([
    z.string().min(1),
    z.array(z.string().min(1)).min(1),
  ]),
});
export type PersonalizationJob = z.infer<typeof PersonalizationJob>;

export const PersonalizationAIOutput = z.object({
  research_insight: z.string().min(1),
  value_prop: z.string().min(1),
  prior_context: z.string().min(1).nullable(),
  confidence: z.enum(["high", "medium", "low"]),
  grounding_notes: z.string().min(1),
});
export type PersonalizationAIOutput = z.infer<typeof PersonalizationAIOutput>;

export const ApprovalQueueDraft = z.object({
  id: z.string().uuid(),
  lead_id: z.string().uuid(),
  draft_subject: z.string().min(1),
  draft_body: z.string().min(1),
  step_number: z.number().int().min(1),
  status: z.literal("PENDING"),
});
export type ApprovalQueueDraft = z.infer<typeof ApprovalQueueDraft>;
