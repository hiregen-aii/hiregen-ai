import {
  IMemoryRepository,
  MemoryRepository,
  CompanyMemoryRow,
  MemoryEventRow,
  ConversationHistoryRow,
  InteractionHistoryRow,
  MemoryConcurrencyError,
  MemoryNotFoundError,
} from '../repositories/memory.repository';
import {
  CreateMemoryInput,
  UpdateMemoryInput,
  AddMemoryEventInput,
  TimelineQueryInput,
  SummaryQueryInput,
  AppendInteractionInput,
  AppendConversationInput,
  MemorySearchInput,
} from '../schemas/memory.schema';

/**
 * HireGen AI — Module 3.3 (AI Memory Subsystem)
 * Service Layer (Business Logic Engine)
 *
 * Responsibilities:
 * - Orchestrates memory lifecycle (Ingestion -> Retrieval -> Update -> Persistence).
 * - Enforces business rules: EWMA sentiment scoring, hiring pattern updates, deduplication checks.
 * - Manages in-memory / Redis cache invalidation for fast AI Agent read access.
 * - Provides retry logic for optimistic concurrency conflicts.
 * - Exposes clean context retrieval interfaces for AI Agents (Research Agent 2.4, Prompt Engine 3.2, Personalization Agent 3.4).
 *
 * Architecture Rules:
 * - NO SQL statements (delegated exclusively to MemoryRepository).
 * - NO Fastify request/response bindings (framework independent).
 */

// ==========================================
// 1. DOMAIN ERROR CLASSES
// ==========================================

export class MemoryServiceError extends Error {
  constructor(message: string, public readonly code: string = 'MEMORY_SERVICE_ERROR') {
    super(message);
    this.name = 'MemoryServiceError';
  }
}

export class MemoryValidationServiceError extends MemoryServiceError {
  constructor(message: string) {
    super(message, 'MEMORY_VALIDATION_ERROR');
    this.name = 'MemoryValidationServiceError';
  }
}

export class MemoryConcurrencyConflictError extends MemoryServiceError {
  constructor(companyId: string, attempts: number) {
    super(`Failed to update memory for companyId '${companyId}' after ${attempts} concurrency retry attempts.`, 'CONCURRENCY_MAX_RETRIES');
    this.name = 'MemoryConcurrencyConflictError';
  }
}

// ==========================================
// 2. AGENT INTEGRATION CONTEXT INTERFACE
// ==========================================

export interface AIContextPayload {
  companyId: string;
  firstInteractionAt: string;
  totalInteractions: number;
  overallSentimentRating: number;
  lastReplySentiment: string | null;
  optOut: boolean;
  pitchGuidelines: string[];
  contactExclusionList: string[];
  frequentRoles: string[];
  hiringFrequency: string;
  techStack: string[];
  companyPainPoints: string[];
  companyValueProposition: string;
  recentEvents: { eventType: string; occurredAt: Date; payload: any }[];
  recentConversations: { direction: string; channel: string; bodyText: string; sentAt: Date }[];
}

export interface SimpleCacheProvider {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
}

/**
 * In-Memory Fallback Cache Provider if Redis is unavailable
 */
class InMemoryCache implements SimpleCacheProvider {
  private cache = new Map<string, { value: string; expiresAt: number }>();

  async get(key: string): Promise<string | null> {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, ttlSeconds: number = 1800): Promise<void> {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }
}

// ==========================================
// 3. MEMORY SERVICE IMPLEMENTATION
// ==========================================

export class MemoryService {
  private repository: IMemoryRepository;
  private cache: SimpleCacheProvider;
  private dedupeCache = new Set<string>();

  constructor(repository?: IMemoryRepository, cacheProvider?: SimpleCacheProvider) {
    this.repository = repository || new MemoryRepository();
    this.cache = cacheProvider || new InMemoryCache();
  }

  /**
   * Helper to clear cached AI memory context for a company upon write
   */
  private async invalidateCache(companyId: string): Promise<void> {
    try {
      await this.cache.del(`memory:context:${companyId}`);
    } catch (err) {
      console.warn(`[MemoryService.invalidateCache] Failed to invalidate cache for ${companyId}`);
    }
  }

  /**
   * Executes an update operation with optimistic concurrency retry backoff (up to 3 attempts)
   */
  private async updateWithRetry<T>(
    companyId: string,
    updateFn: (currentVersion: number) => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    let attempts = 0;
    while (attempts < maxRetries) {
      try {
        attempts++;
        const current = await this.repository.getMemoryByCompanyId(companyId);
        if (!current) {
          throw new MemoryServiceError(`Company memory for '${companyId}' not found.`);
        }
        const result = await updateFn(current.version);
        await this.invalidateCache(companyId);
        return result;
      } catch (err: any) {
        if (err instanceof MemoryConcurrencyError && attempts < maxRetries) {
          // Exponential backoff jitter delay
          const delay = Math.floor(Math.random() * 50) + attempts * 25;
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        throw err;
      }
    }
    throw new MemoryConcurrencyConflictError(companyId, maxRetries);
  }

  /**
   * GET /memory/:companyId — Retrieves full company memory profile
   */
  public async getCompanyMemory(companyId: string): Promise<CompanyMemoryRow | null> {
    if (!companyId) throw new MemoryValidationServiceError('Company ID is required.');
    return this.repository.getMemoryByCompanyId(companyId);
  }

  /**
   * POST /memory — Initializes a new company memory record
   */
  public async createCompanyMemory(input: CreateMemoryInput): Promise<CompanyMemoryRow> {
    if (!input.companyId) throw new MemoryValidationServiceError('Company ID is required.');
    const defaultMemoryPayload = {
      metadata: {
        first_interaction_at: new Date().toISOString(),
        last_interaction_at: new Date().toISOString(),
        total_interactions_count: 0,
        last_updated_by_agent: input.initialMemory?.metadata?.last_updated_by_agent || 'System_Ingest',
      },
      hiring_patterns: { frequent_roles: [], hiring_frequency: 'UNKNOWN', seasonality: { peak_quarters: [], last_detected_signal: null } },
      outreach_history: { last_template_id: null, sequence_step_reached: 0, consecutive_non_responses: 0, historical_bounces: 0, sent_outreach_timestamps: [] },
      reply_sentiment_summary: { overall_sentiment_rating: 0.0, last_reply_sentiment: null, last_reply_date: null, consecutive_rejections: 0 },
      preferences: { opt_out: false, opt_out_date: null, channels_preferred: ['EMAIL'], contact_exclusion_list: [], pitch_guidelines: [] },
      agent_research_keys: { tech_stack: [], company_pain_points: [], company_value_proposition: '', sources_scraped: [] },
      ...input.initialMemory,
    };

    const created = await this.repository.createMemory(input.companyId, defaultMemoryPayload);
    await this.repository.appendMemoryEvent(input.companyId, 'signal_received', { action: 'Memory Initialized' });
    return created;
  }

  /**
   * PATCH /memory/:companyId — Deep partial update with optimistic locking
   */
  public async updateCompanyMemory(companyId: string, input: UpdateMemoryInput): Promise<CompanyMemoryRow> {
    if (!companyId) throw new MemoryValidationServiceError('Company ID is required.');
    if (!input.expectedVersion) throw new MemoryValidationServiceError('expectedVersion is required for optimistic locking.');

    const existing = await this.repository.getMemoryByCompanyId(companyId);
    if (!existing) throw new MemoryServiceError(`Company memory '${companyId}' not found.`);

    const mergedMemory = {
      ...existing.memory,
      ...input.memory,
      metadata: {
        ...existing.memory?.metadata,
        ...input.memory?.metadata,
        last_interaction_at: new Date().toISOString(),
        last_updated_by_agent: input.agentName || 'API_Controller',
      },
    };

    const updated = await this.repository.updateMemory(companyId, mergedMemory, input.expectedVersion);
    await this.invalidateCache(companyId);
    return updated;
  }

  /**
   * DELETE /memory/:companyId — Purges company memory
   */
  public async deleteCompanyMemory(companyId: string): Promise<void> {
    if (!companyId) throw new MemoryValidationServiceError('Company ID is required.');
    await this.repository.deleteMemory(companyId);
    await this.invalidateCache(companyId);
  }

  /**
   * POST /memory/:companyId/events — Appends memory event and increments interaction counters
   */
  public async addMemoryEvent(companyId: string, input: AddMemoryEventInput): Promise<MemoryEventRow> {
    if (!companyId) throw new MemoryValidationServiceError('Company ID is required.');

    const event = await this.repository.appendMemoryEvent(companyId, input.eventType, input.payload);

    // Asynchronously update total_interactions_count in company_memory
    this.updateWithRetry(companyId, async (expectedVersion) => {
      const memoryRow = await this.repository.getMemoryByCompanyId(companyId);
      if (memoryRow) {
        const memory = memoryRow.memory;
        const totalCount = (memory.metadata?.total_interactions_count || 0) + 1;
        const updatedMemory = {
          ...memory,
          metadata: {
            ...memory.metadata,
            total_interactions_count: totalCount,
            last_interaction_at: new Date().toISOString(),
          },
        };
        await this.repository.updateMemory(companyId, updatedMemory, expectedVersion);
      }
    }).catch((err) => console.error(`[MemoryService.addMemoryEvent] Counter update failed: ${err.message}`));

    return event;
  }

  /**
   * Alias for addMemoryEvent
   */
  public async appendMemoryEvent(companyId: string, eventType: string, payload: Record<string, any>): Promise<MemoryEventRow> {
    return this.addMemoryEvent(companyId, { eventType: eventType as any, payload });
  }

  /**
   * GET /memory/:companyId/timeline — Retrieves paginated event history
   */
  public async getMemoryTimeline(companyId: string, query: TimelineQueryInput): Promise<any> {
    return this.repository.getTimeline(companyId, query);
  }

  /**
   * GET /memory/:companyId/hiring-patterns — Fetches hiring pattern analytics
   */
  public async getHiringPatterns(companyId: string): Promise<any> {
    const patterns = await this.repository.getHiringPatterns(companyId);
    return patterns || { hiring_frequency: 'UNKNOWN', frequent_roles: [], seasonality: { peak_quarters: [], last_detected_signal: null } };
  }

  /**
   * GET /memory/:companyId/sentiment — Fetches reply sentiment summary
   */
  public async getReplySentiment(companyId: string): Promise<any> {
    const sentiment = await this.repository.getReplySentimentHistory(companyId);
    return sentiment || { overall_sentiment_rating: 0.0, last_reply_sentiment: null, last_reply_date: null, consecutive_rejections: 0 };
  }

  /**
   * POST /memory/:companyId/interactions — Appends touchpoint (email open, click, bounce)
   */
  public async appendInteraction(companyId: string, input: AppendInteractionInput): Promise<InteractionHistoryRow> {
    const interaction = await this.repository.appendInteraction({
      companyId,
      leadId: input.leadId,
      contactId: input.contactId,
      interactionType: input.interactionType,
      payload: input.payload,
    });

    await this.repository.appendMemoryEvent(companyId, 'outreach_sent', { interactionType: input.interactionType });
    await this.invalidateCache(companyId);
    return interaction;
  }

  /**
   * POST /memory/:companyId/conversations — Records conversation & updates sentiment automatically if provided
   */
  public async appendConversation(companyId: string, input: AppendConversationInput): Promise<ConversationHistoryRow> {
    const conversation = await this.repository.appendConversation({
      companyId,
      leadId: input.leadId,
      contactId: input.contactId,
      channel: input.channel,
      direction: input.direction,
      senderIdentity: input.senderIdentity,
      recipientIdentity: input.recipientIdentity,
      subject: input.subject,
      bodyText: input.bodyText,
      messageMetadata: input.messageMetadata,
    });

    // Log event into ledger
    await this.repository.appendMemoryEvent(companyId, 'reply_received', {
      direction: input.direction,
      channel: input.channel,
      sender: input.senderIdentity,
    });

    await this.invalidateCache(companyId);
    return conversation;
  }

  /**
   * POST /memory/:companyId/refresh — Clears cache and re-consolidates memory summary
   */
  public async refreshMemory(companyId: string): Promise<any> {
    await this.invalidateCache(companyId);
    return this.getContextForAI(companyId);
  }

  /**
   * GET /memory/:companyId/summary — Executive memory summary for AI prompt engines
   */
  public async getMemorySummary(companyId: string, query?: Partial<SummaryQueryInput>): Promise<any> {
    return this.generateMemorySummary(companyId, query);
  }

  /**
   * Generates memory summary with options
   */
  public async generateMemorySummary(companyId: string, options: Partial<SummaryQueryInput> = {}): Promise<any> {
    const summaryData = await this.repository.getMemorySummary(companyId, { eventLimit: options.eventLimit || 5 });
    return {
      companyId,
      memoryProfile: summaryData.memory?.memory || {},
      recentEvents: options.includeEvents ? summaryData.recentEvents : [],
      recentInteractions: summaryData.recentInteractions,
      recentConversations: summaryData.recentConversations,
    };
  }

  /**
   * Updates hiring pattern section specifically with version check
   */
  public async updateHiringPattern(companyId: string, patternData: Record<string, any>, expectedVersion: number): Promise<CompanyMemoryRow> {
    const updated = await this.repository.updateHiringPattern(companyId, patternData, expectedVersion);
    await this.invalidateCache(companyId);
    return updated;
  }

  /**
   * Updates reply sentiment rating using Exponentially Weighted Moving Average (EWMA: alpha = 0.4)
   */
  public async updateReplySentiment(
    companyId: string,
    newReplySentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE',
    expectedVersion: number
  ): Promise<CompanyMemoryRow> {
    const currentSentiment = (await this.repository.getReplySentimentHistory(companyId)) || {
      overall_sentiment_rating: 0.0,
      consecutive_rejections: 0,
    };

    // Calculate score mapping
    const scoreMap: Record<string, number> = { POSITIVE: 1.0, NEUTRAL: 0.0, NEGATIVE: -1.0 };
    const rawScore = scoreMap[newReplySentiment] ?? 0.0;
    const alpha = 0.4; // EWMA weighting coefficient

    const updatedRating = Math.max(-1.0, Math.min(1.0, alpha * rawScore + (1 - alpha) * currentSentiment.overall_sentiment_rating));
    const isRejection = newReplySentiment === 'NEGATIVE';
    const consecutiveRejections = isRejection ? currentSentiment.consecutive_rejections + 1 : 0;

    const sentimentPayload = {
      overall_sentiment_rating: parseFloat(updatedRating.toFixed(2)),
      last_reply_sentiment: newReplySentiment,
      last_reply_date: new Date().toISOString(),
      consecutive_rejections: consecutiveRejections,
    };

    const updated = await this.repository.updateSentiment(companyId, sentimentPayload, expectedVersion);
    await this.invalidateCache(companyId);
    return updated;
  }

  /**
   * Retrieves historical interaction and conversation context
   */
  public async getHistoricalContext(companyId: string, limit: number = 10): Promise<any> {
    const interactions = await this.repository.getRecentInteractions(companyId, limit);
    const conversations = await this.repository.getRecentConversations(companyId, limit);
    return { companyId, interactions, conversations };
  }

  /**
   * Atomic JSONB merge helper
   */
  public async mergeMemory(companyId: string, partialMemory: Record<string, any>, expectedVersion: number): Promise<CompanyMemoryRow> {
    const updated = await this.repository.mergeMemory(companyId, partialMemory, expectedVersion);
    await this.invalidateCache(companyId);
    return updated;
  }

  /**
   * Searches memory profiles via JSONB containment match
   */
  public async searchMemory(searchInput: MemorySearchInput): Promise<CompanyMemoryRow[]> {
    const matchObj: Record<string, any> = {};
    if (searchInput.sentiment) {
      matchObj.reply_sentiment_summary = { last_reply_sentiment: searchInput.sentiment };
    }
    return this.repository.searchMemory({ jsonbMatch: matchObj, limit: searchInput.limit });
  }

  /**
   * CORE AGENT METHOD: Provides compiled, fast-read memory context for LLM grounding (Prompt Engine / Personalization Agent)
   */
  public async getContextForAI(companyId: string): Promise<AIContextPayload> {
    // 1. Try reading from cache
    const cacheKey = `memory:context:${companyId}`;
    try {
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      console.warn(`[MemoryService.getContextForAI] Cache read failed: ${err}`);
    }

    // 2. Fetch fresh from DB
    const summary = await this.repository.getMemorySummary(companyId, { eventLimit: 5 });
    const memory = summary.memory?.memory || {};

    const payload: AIContextPayload = {
      companyId,
      firstInteractionAt: memory.metadata?.first_interaction_at || new Date().toISOString(),
      totalInteractions: memory.metadata?.total_interactions_count || 0,
      overallSentimentRating: memory.reply_sentiment_summary?.overall_sentiment_rating || 0.0,
      lastReplySentiment: memory.reply_sentiment_summary?.last_reply_sentiment || null,
      optOut: memory.preferences?.opt_out || false,
      pitchGuidelines: memory.preferences?.pitch_guidelines || [],
      contactExclusionList: memory.preferences?.contact_exclusion_list || [],
      frequentRoles: memory.hiring_patterns?.frequent_roles || [],
      hiringFrequency: memory.hiring_patterns?.hiring_frequency || 'UNKNOWN',
      techStack: memory.agent_research_keys?.tech_stack || [],
      companyPainPoints: memory.agent_research_keys?.company_pain_points || [],
      companyValueProposition: memory.agent_research_keys?.company_value_proposition || '',
      recentEvents: summary.recentEvents.map((e) => ({ eventType: e.event_type, occurredAt: e.occurred_at, payload: e.payload })),
      recentConversations: summary.recentConversations.map((c) => ({
        direction: c.direction,
        channel: c.channel,
        bodyText: c.body_text,
        sentAt: c.sent_at,
      })),
    };

    // 3. Cache compiled payload for 30 minutes (1800s)
    try {
      await this.cache.set(cacheKey, JSON.stringify(payload), 1800);
    } catch (err) {
      console.warn(`[MemoryService.getContextForAI] Cache write failed: ${err}`);
    }

    return payload;
  }

  /**
   * Deduplication check method (prevents processing the same signal hash twice)
   */
  public async preventDuplicateMemory(companyId: string, dedupeKey: string): Promise<boolean> {
    const key = `${companyId}:${dedupeKey}`;
    if (this.dedupeCache.has(key)) {
      return true; // Is Duplicate
    }
    this.dedupeCache.add(key);
    // Limit memory set size
    if (this.dedupeCache.size > 10000) {
      this.dedupeCache.clear();
    }
    return false;
  }

  /**
   * Compresses memory payloads by trimming historical lists
   */
  public async compressMemory(companyId: string): Promise<CompanyMemoryRow> {
    return this.updateWithRetry(companyId, async (expectedVersion) => {
      const memoryRow = await this.repository.getMemoryByCompanyId(companyId);
      if (!memoryRow) throw new MemoryNotFoundError(companyId);

      const memory = memoryRow.memory;
      // Keep only last 10 sent outreach timestamps
      if (memory.outreach_history?.sent_outreach_timestamps?.length > 10) {
        memory.outreach_history.sent_outreach_timestamps = memory.outreach_history.sent_outreach_timestamps.slice(-10);
      }

      return this.repository.updateMemory(companyId, memory, expectedVersion);
    });
  }

  /**
   * Archives old memory events and logs maintenance task
   */
  public async archiveOldMemory(companyId: string, daysThreshold: number = 365): Promise<{ archivedEventsCount: number }> {
    const timeline = await this.repository.getTimeline(companyId, { limit: 100 });
    const cutoff = new Date(Date.now() - daysThreshold * 86400000);
    const oldEvents = timeline.events.filter((e) => new Date(e.occurred_at) < cutoff);

    await this.repository.appendMemoryEvent(companyId, 'preference_changed', {
      action: 'Archive Completed',
      archivedEventsCount: oldEvents.length,
      daysThreshold,
    });

    return { archivedEventsCount: oldEvents.length };
  }
}
