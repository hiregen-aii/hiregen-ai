/**
 * Schemas for the Follow-up Agent runtime contract.
 * These define the input/output and internal context for Module 3.5
 * Follow-up Intelligence, enabling safe sequencing of follow-up outreach
 * on top of the existing Personalization Agent.
 */
import { z } from "zod";
import { PersonalizationJob } from "./personalization-agent.schema.js";

/**
 * FollowUpDecisionReason — why did the agent decide to generate or skip?
 */
export const FollowUpDecisionReason = z.enum([
  "LEAD_REPLIED",                    // Lead has replied - manual handling needed
  "LEAD_CONVERTED",                  // Lead in WON/LOST/MEETING_BOOKED state
  "MAX_STEPS_EXCEEDED",              // Already sent max follow-ups (e.g., 3)
  "TOO_SOON_SINCE_LAST_EMAIL",       // Days since last email < min_days_between
  "READY_FOR_FOLLOWUP",              // All checks passed - generate next step
  "LEAD_NOT_FOUND",                  // Lead doesn't exist in database
  "RESEARCH_MISSING",                // Company research not available
  "CAMPAIGN_MISSING",                // Campaign context missing
  "INTERNAL_ERROR",                  // Unexpected error during processing
]);
export type FollowUpDecisionReason = z.infer<typeof FollowUpDecisionReason>;

/**
 * FollowUpJob — input to the Follow-up Agent from orchestrator (N8N or queue).
 * Triggers the agent to evaluate whether a follow-up should be generated
 * for a specific lead at a specific step in the campaign.
 */
export const FollowUpJob = z.object({
  lead_id: z.string().uuid(),
  campaign_id: z.string().uuid(),
  current_step: z.number().int().min(1),
  // Optional overrides for campaign/environment configuration
  force_generation: z.boolean().optional().default(false),
  max_steps: z.number().int().min(1).optional(),
  days_between_followups: z.number().int().min(1).optional(),
});
export type FollowUpJob = z.infer<typeof FollowUpJob>;

/**
 * FollowUpDecision — output from the Follow-up Agent.
 * Contains the decision (generate or skip) and, if generating,
 * the PersonalizationJob ready to enqueue for draft creation.
 */
export const FollowUpDecision = z.object({
  lead_id: z.string().uuid(),
  should_generate: z.boolean(),
  reason: FollowUpDecisionReason,
  // If should_generate = true, next_step and personalization_job must be present
  next_step: z.number().int().min(2).optional(),
  personalization_job: PersonalizationJob.optional(),
  // Optional context for debugging/analytics
  explanation: z.string().optional(),
  evaluated_at: z.coerce.date().optional(),
});
export type FollowUpDecision = z.infer<typeof FollowUpDecision>;

/**
 * FollowUpContext — internal working state during sequencing decision.
 * NOT exposed externally; used by FollowUpAgent and FollowUpSequencerService
 * to track state during evaluation and context enrichment.
 */
export interface FollowUpContext {
  // Lead state snapshot
  lead: {
    id: string;
    stage: string;  // e.g., "SENT", "REPLIED", "WON", "LOST"
    hiring_type: string;
    urgency: string;
    fit_score: number;
    primary_contact_id: string;
    company_id: string;
  };

  // Campaign context
  campaign: {
    id: string;
    // UNKNOWN: where campaign_value_props come from
    // UNKNOWN: additional campaign config (timings, templates, etc.)
  };

  // Follow-up history (from UNKNOWN: workflow_runs or similar Team 4 table)
  followUpHistory: {
    total_sent: number;
    last_sent_at?: Date;
    days_since_last: number;
    has_replied: boolean;
    last_reply_at?: Date;
    steps_sent: number[];  // e.g., [1, 2] if steps 1 and 2 already sent
  };

  // Timing decision state
  timing: {
    should_generate: boolean;
    next_step: number;  // Which step to generate (2, 3, etc.)
    days_since_last: number;
    min_days_between: number;  // From config or campaign
    max_steps: number;  // From config or campaign
    days_until_ready?: number;  // If TOO_SOON, how many days to wait
  };

  // Research data
  research: {
    summary: string;
    source_urls: string[];
  };

  // Company memory for context (Team 2 writes, Team 3 reads and extends)
  company_memory: unknown;  // UNKNOWN: exact structure from Team 2
}
