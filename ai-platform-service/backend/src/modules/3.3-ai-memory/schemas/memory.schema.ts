import { z } from 'zod';

/**
 * HireGen AI — Module 3.3 (AI Memory Subsystem)
 * Validation Schemas (Zod)
 *
 * Provides runtime validation, JSONB payload validation, Fastify schema bindings,
 * and static TypeScript type inferences for all memory-related requests and responses.
 */

// ==========================================
// 1. COMMON & PARAM SCHEMAS
// ==========================================

/**
 * Path parameter validation for companyId (UUID v4 format)
 */
export const companyIdParamsSchema = z.object({
  companyId: z.string().uuid({ message: 'Invalid company ID format. Must be a valid UUID v4.' }),
});

export type CompanyIdParams = z.infer<typeof companyIdParamsSchema>;

/**
 * Standard pagination and filtering query parameters
 */
export const timelineQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(20),
  page: z.coerce.number().int().positive().default(1),
  eventType: z.string().trim().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export type TimelineQueryInput = z.infer<typeof timelineQuerySchema>;

export const summaryQuerySchema = z.object({
  includeEvents: z.coerce.boolean().default(true),
  includePatterns: z.coerce.boolean().default(true),
  eventLimit: z.coerce.number().int().positive().max(50).default(5),
});

export type SummaryQueryInput = z.infer<typeof summaryQuerySchema>;

export const memorySearchSchema = z.object({
  query: z.string().trim().min(1, { message: 'Search query cannot be empty' }),
  hiringType: z.enum(['INTERN', 'FULL_TIME', 'CONTRACT', 'BULK_HIRING', 'CAMPUS_DRIVE']).optional(),
  sentiment: z.enum(['POSITIVE', 'NEUTRAL', 'NEGATIVE']).optional(),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

export type MemorySearchInput = z.infer<typeof memorySearchSchema>;

// ==========================================
// 2. JSONB SUB-STRUCTURE SCHEMAS
// ==========================================

export const hiringPatternSchema = z.object({
  frequent_roles: z.array(z.string()).default([]),
  hiring_frequency: z.enum(['HIGH', 'MEDIUM', 'LOW', 'UNKNOWN']).default('UNKNOWN'),
  seasonality: z
    .object({
      peak_quarters: z.array(z.string()).default([]),
      last_detected_signal: z.string().datetime().nullable().default(null),
    })
    .default({ peak_quarters: [], last_detected_signal: null }),
});

export type HiringPattern = z.infer<typeof hiringPatternSchema>;

export const replySentimentSchema = z.object({
  overall_sentiment_rating: z.number().min(-1.0).max(1.0).default(0.0),
  last_reply_sentiment: z.enum(['POSITIVE', 'NEUTRAL', 'NEGATIVE']).nullable().default(null),
  last_reply_date: z.string().datetime().nullable().default(null),
  consecutive_rejections: z.number().int().nonnegative().default(0),
});

export type ReplySentiment = z.infer<typeof replySentimentSchema>;

export const memoryPreferencesSchema = z.object({
  opt_out: z.boolean().default(false),
  opt_out_date: z.string().datetime().nullable().default(null),
  channels_preferred: z.array(z.enum(['EMAIL', 'LINKEDIN', 'CALL'])).default(['EMAIL']),
  contact_exclusion_list: z.array(z.string().email()).default([]),
  pitch_guidelines: z.array(z.string()).default([]),
});

export type MemoryPreferences = z.infer<typeof memoryPreferencesSchema>;

export const agentResearchKeysSchema = z.object({
  tech_stack: z.array(z.string()).default([]),
  company_pain_points: z.array(z.string()).default([]),
  company_value_proposition: z.string().default(''),
  sources_scraped: z.array(z.string().url()).default([]),
});

export type AgentResearchKeys = z.infer<typeof agentResearchKeysSchema>;

export const outreachHistorySchema = z.object({
  last_template_id: z.string().uuid().nullable().default(null),
  sequence_step_reached: z.number().int().nonnegative().default(0),
  consecutive_non_responses: z.number().int().nonnegative().default(0),
  historical_bounces: z.number().int().nonnegative().default(0),
  sent_outreach_timestamps: z.array(z.string().datetime()).default([]),
});

export type OutreachHistory = z.infer<typeof outreachHistorySchema>;

/**
 * Full JSONB Memory Schema representing company memory structure
 */
export const memoryPayloadSchema = z.object({
  metadata: z
    .object({
      first_interaction_at: z.string().datetime().default(() => new Date().toISOString()),
      last_interaction_at: z.string().datetime().default(() => new Date().toISOString()),
      total_interactions_count: z.number().int().nonnegative().default(0),
      last_updated_by_agent: z.string().default('System'),
    })
    .default({
      first_interaction_at: new Date().toISOString(),
      last_interaction_at: new Date().toISOString(),
      total_interactions_count: 0,
      last_updated_by_agent: 'System',
    }),
  hiring_patterns: hiringPatternSchema.default({
    frequent_roles: [],
    hiring_frequency: 'UNKNOWN',
    seasonality: { peak_quarters: [], last_detected_signal: null },
  }),
  outreach_history: outreachHistorySchema.default({
    last_template_id: null,
    sequence_step_reached: 0,
    consecutive_non_responses: 0,
    historical_bounces: 0,
    sent_outreach_timestamps: [],
  }),
  reply_sentiment_summary: replySentimentSchema.default({
    overall_sentiment_rating: 0.0,
    last_reply_sentiment: null,
    last_reply_date: null,
    consecutive_rejections: 0,
  }),
  preferences: memoryPreferencesSchema.default({
    opt_out: false,
    opt_out_date: null,
    channels_preferred: ['EMAIL'],
    contact_exclusion_list: [],
    pitch_guidelines: [],
  }),
  agent_research_keys: agentResearchKeysSchema.default({
    tech_stack: [],
    company_pain_points: [],
    company_value_proposition: '',
    sources_scraped: [],
  }),
});

export type MemoryPayload = z.infer<typeof memoryPayloadSchema>;

// ==========================================
// 3. MUTATION SCHEMAS (CREATE, UPDATE, EVENTS)
// ==========================================

export const createMemorySchema = z.object({
  companyId: z.string().uuid({ message: 'Valid companyId UUID required' }),
  initialMemory: memoryPayloadSchema.deepPartial().optional(),
});

export type CreateMemoryInput = z.infer<typeof createMemorySchema>;

export const updateMemorySchema = z.object({
  memory: memoryPayloadSchema.deepPartial().optional(),
  expectedVersion: z.number().int().positive({ message: 'expectedVersion must be positive for optimistic locking' }),
  agentName: z.string().optional().default('API_Controller'),
});

export type UpdateMemoryInput = z.infer<typeof updateMemorySchema>;

export const memoryEventSchema = z.object({
  eventType: z.enum([
    'signal_received',
    'research_appended',
    'outreach_drafted',
    'outreach_sent',
    'reply_received',
    'sentiment_classified',
    'meeting_booked',
    'preference_changed',
  ]),
  payload: z.record(z.string(), z.any()).default({}),
});

export type AddMemoryEventInput = z.infer<typeof memoryEventSchema>;

export const interactionSchema = z.object({
  leadId: z.string().uuid().optional(),
  contactId: z.string().uuid().optional(),
  interactionType: z.enum([
    'EMAIL_OPEN',
    'LINK_CLICK',
    'BOUNCE',
    'SPAM_REPORT',
    'MEETING_BOOKED',
    'CALL_PLACED',
  ]),
  payload: z.record(z.string(), z.any()).default({}),
});

export type AppendInteractionInput = z.infer<typeof interactionSchema>;

export const conversationSchema = z.object({
  leadId: z.string().uuid().optional(),
  contactId: z.string().uuid().optional(),
  channel: z.enum(['EMAIL', 'LINKEDIN', 'WHATSAPP']).default('EMAIL'),
  direction: z.enum(['INBOUND', 'OUTBOUND']),
  senderIdentity: z.string().min(1, { message: 'Sender identity required' }),
  recipientIdentity: z.string().min(1, { message: 'Recipient identity required' }),
  subject: z.string().optional(),
  bodyText: z.string().min(1, { message: 'Message body text required' }),
  messageMetadata: z.record(z.string(), z.any()).default({}),
});

export type AppendConversationInput = z.infer<typeof conversationSchema>;

// ==========================================
// 4. RESPONSE ENVELOPE CONTRACT
// ==========================================

export interface StandardEnvelope<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  meta: {
    requestId: string;
    timestamp: string;
    version?: string;
  };
}
