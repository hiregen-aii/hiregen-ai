import { Pool, PoolClient } from 'pg';

/**
 * HireGen AI — Module 3.3 (AI Memory Subsystem)
 * Memory Repository
 *
 * Direct database access layer for AI Memory tables:
 * - company_memory
 * - memory_events
 * - conversation_history
 * - interaction_history
 *
 * Principles:
 * - Parameterized SQL queries ONLY (100% protection against SQL Injection)
 * - Pure data access layer (NO business logic, NO Fastify dependencies, NO LLM calls)
 * - Optimistic Concurrency Control via `version` column checks
 * - Transaction support via optional `PoolClient` parameter
 * - Production error wrapping & strict TypeScript typing
 */

// ==========================================
// 1. DATA ENTITY INTERFACES
// ==========================================

export interface CompanyMemoryRow {
  id: string;
  company_id: string;
  memory: Record<string, any>;
  version: number;
  created_at: Date;
  updated_at: Date;
}

export interface MemoryEventRow {
  id: string;
  company_id: string;
  event_type: string;
  payload: Record<string, any>;
  occurred_at: Date;
}

export interface ConversationHistoryRow {
  id: string;
  lead_id: string | null;
  company_id: string;
  contact_id: string | null;
  channel: 'EMAIL' | 'LINKEDIN' | 'WHATSAPP';
  direction: 'INBOUND' | 'OUTBOUND';
  sender_identity: string;
  recipient_identity: string;
  subject: string | null;
  body_text: string;
  message_metadata: Record<string, any>;
  sent_at: Date;
}

export interface InteractionHistoryRow {
  id: string;
  lead_id: string | null;
  company_id: string;
  contact_id: string | null;
  interaction_type: string;
  payload: Record<string, any>;
  occurred_at: Date;
}

export interface AppendConversationData {
  leadId?: string;
  companyId: string;
  contactId?: string;
  channel: 'EMAIL' | 'LINKEDIN' | 'WHATSAPP';
  direction: 'INBOUND' | 'OUTBOUND';
  senderIdentity: string;
  recipientIdentity: string;
  subject?: string;
  bodyText: string;
  messageMetadata?: Record<string, any>;
}

export interface AppendInteractionData {
  leadId?: string;
  companyId: string;
  contactId?: string;
  interactionType: string;
  payload?: Record<string, any>;
}

export interface TimelineFilterOptions {
  limit?: number;
  page?: number;
  eventType?: string;
  startDate?: string;
  endDate?: string;
}

export interface MemorySearchOptions {
  jsonbMatch?: Record<string, any>;
  limit?: number;
  offset?: number;
}

export interface HiringPatternData {
  frequent_roles: string[];
  hiring_frequency: string;
  seasonality: {
    peak_quarters: string[];
    last_detected_signal: string | null;
  };
}

export interface ReplySentimentData {
  overall_sentiment_rating: number;
  last_reply_sentiment: string | null;
  last_reply_date: string | null;
  consecutive_rejections: number;
}

// ==========================================
// 2. REPOSITORY ERROR CLASSES
// ==========================================

export class MemoryRepositoryError extends Error {
  constructor(message: string, public readonly originalError?: Error) {
    super(message);
    this.name = 'MemoryRepositoryError';
  }
}

export class MemoryNotFoundError extends MemoryRepositoryError {
  constructor(companyId: string) {
    super(`Memory profile for companyId '${companyId}' was not found.`);
    this.name = 'MemoryNotFoundError';
  }
}

export class MemoryConcurrencyError extends MemoryRepositoryError {
  constructor(companyId: string, expectedVersion: number) {
    super(`Concurrency Conflict: Memory for companyId '${companyId}' version did not match expected version (${expectedVersion}).`);
    this.name = 'MemoryConcurrencyError';
  }
}

export class MemoryDuplicateError extends MemoryRepositoryError {
  constructor(message: string) {
    super(message);
    this.name = 'MemoryDuplicateError';
  }
}

// ==========================================
// 3. REPOSITORY INTERFACE CONTRACT
// ==========================================

export interface IMemoryRepository {
  createMemory(companyId: string, initialMemory?: Record<string, any>, client?: PoolClient): Promise<CompanyMemoryRow>;
  getMemoryByCompanyId(companyId: string, client?: PoolClient): Promise<CompanyMemoryRow | null>;
  updateMemory(companyId: string, memoryData: Record<string, any>, expectedVersion: number, client?: PoolClient): Promise<CompanyMemoryRow>;
  deleteMemory(companyId: string, client?: PoolClient): Promise<boolean>;
  appendMemoryEvent(companyId: string, eventType: string, payload: Record<string, any>, client?: PoolClient): Promise<MemoryEventRow>;
  appendConversation(data: AppendConversationData, client?: PoolClient): Promise<ConversationHistoryRow>;
  appendInteraction(data: AppendInteractionData, client?: PoolClient): Promise<InteractionHistoryRow>;
  getTimeline(companyId: string, options?: TimelineFilterOptions): Promise<{ events: MemoryEventRow[]; total: number }>;
  getHiringPatterns(companyId: string): Promise<HiringPatternData | null>;
  getReplySentimentHistory(companyId: string): Promise<ReplySentimentData | null>;
  updateHiringPattern(companyId: string, patternData: Record<string, any>, expectedVersion: number): Promise<CompanyMemoryRow>;
  updateSentiment(companyId: string, sentimentData: Record<string, any>, expectedVersion: number): Promise<CompanyMemoryRow>;
  searchMemory(options: MemorySearchOptions): Promise<CompanyMemoryRow[]>;
  memoryExists(companyId: string): Promise<boolean>;
  mergeMemory(companyId: string, partialMemory: Record<string, any>, expectedVersion: number): Promise<CompanyMemoryRow>;
  getRecentInteractions(companyId: string, limit?: number): Promise<InteractionHistoryRow[]>;
  getRecentConversations(companyId: string, limit?: number): Promise<ConversationHistoryRow[]>;
  getMemorySummary(companyId: string, options?: { eventLimit?: number }): Promise<{
    memory: CompanyMemoryRow | null;
    recentEvents: MemoryEventRow[];
    recentInteractions: InteractionHistoryRow[];
    recentConversations: ConversationHistoryRow[];
  }>;
  executeTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T>;
}

// ==========================================
// 4. REPOSITORY CLASS IMPLEMENTATION
// ==========================================

export class MemoryRepository implements IMemoryRepository {
  private pool: Pool;

  constructor(dbPool?: Pool) {
    if (dbPool) {
      this.pool = dbPool;
    } else {
      // Default connection pool fallback
      const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/hiregen_ai';
      this.pool = new Pool({ connectionString, max: 20, idleTimeoutMillis: 30000 });
    }
  }

  /**
   * Helper to execute queries on client if provided (for transactions) or pool
   */
  private getQueryRunner(client?: PoolClient) {
    return client || this.pool;
  }

  /**
   * Executes a callback within a managed database transaction
   */
  public async executeTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (err: any) {
      await client.query('ROLLBACK');
      console.error(`[MemoryRepository.transaction] Rollback due to error: ${err.message}`);
      throw new MemoryRepositoryError(`Transaction failed: ${err.message}`, err);
    } finally {
      client.release();
    }
  }

  /**
   * Initializes a new company memory profile record in company_memory table
   */
  public async createMemory(
    companyId: string,
    initialMemory: Record<string, any> = {},
    client?: PoolClient
  ): Promise<CompanyMemoryRow> {
    const sql = `
      INSERT INTO company_memory (company_id, memory, version, created_at, updated_at)
      VALUES ($1, $2::jsonb, 1, NOW(), NOW())
      RETURNING id, company_id, memory, version, created_at, updated_at;
    `;
    try {
      const runner = this.getQueryRunner(client);
      const res = await runner.query(sql, [companyId, JSON.stringify(initialMemory)]);
      return res.rows[0];
    } catch (err: any) {
      if (err.code === '23505') {
        throw new MemoryDuplicateError(`Company memory for companyId '${companyId}' already exists.`);
      }
      console.error(`[MemoryRepository.createMemory] Error: ${err.message}`);
      throw new MemoryRepositoryError(`Failed to create company memory: ${err.message}`, err);
    }
  }

  /**
   * Fetches company memory row by company_id
   */
  public async getMemoryByCompanyId(
    companyId: string,
    client?: PoolClient
  ): Promise<CompanyMemoryRow | null> {
    const sql = `
      SELECT id, company_id, memory, version, created_at, updated_at
      FROM company_memory
      WHERE company_id = $1;
    `;
    try {
      const runner = this.getQueryRunner(client);
      const res = await runner.query(sql, [companyId]);
      return res.rows.length > 0 ? res.rows[0] : null;
    } catch (err: any) {
      console.error(`[MemoryRepository.getMemoryByCompanyId] Error: ${err.message}`);
      throw new MemoryRepositoryError(`Failed to fetch company memory: ${err.message}`, err);
    }
  }

  /**
   * Updates company memory profile with Optimistic Concurrency Control (verifies expectedVersion)
   */
  public async updateMemory(
    companyId: string,
    memoryData: Record<string, any>,
    expectedVersion: number,
    client?: PoolClient
  ): Promise<CompanyMemoryRow> {
    const sql = `
      UPDATE company_memory
      SET memory = $1::jsonb,
          version = version + 1,
          updated_at = NOW()
      WHERE company_id = $2 AND version = $3
      RETURNING id, company_id, memory, version, created_at, updated_at;
    `;
    try {
      const runner = this.getQueryRunner(client);
      const res = await runner.query(sql, [JSON.stringify(memoryData), companyId, expectedVersion]);
      if (res.rows.length === 0) {
        // Verify if company exists to throw correct exception
        const exists = await this.memoryExists(companyId);
        if (!exists) {
          throw new MemoryNotFoundError(companyId);
        }
        throw new MemoryConcurrencyError(companyId, expectedVersion);
      }
      return res.rows[0];
    } catch (err: any) {
      if (err instanceof MemoryNotFoundError || err instanceof MemoryConcurrencyError) {
        throw err;
      }
      console.error(`[MemoryRepository.updateMemory] Error: ${err.message}`);
      throw new MemoryRepositoryError(`Failed to update company memory: ${err.message}`, err);
    }
  }

  /**
   * Deletes company memory profile
   */
  public async deleteMemory(companyId: string, client?: PoolClient): Promise<boolean> {
    const sql = `
      DELETE FROM company_memory
      WHERE company_id = $1;
    `;
    try {
      const runner = this.getQueryRunner(client);
      const res = await runner.query(sql, [companyId]);
      return (res.rowCount ?? 0) > 0;
    } catch (err: any) {
      console.error(`[MemoryRepository.deleteMemory] Error: ${err.message}`);
      throw new MemoryRepositoryError(`Failed to delete company memory: ${err.message}`, err);
    }
  }

  /**
   * Appends an audit event to the memory_events ledger table
   */
  public async appendMemoryEvent(
    companyId: string,
    eventType: string,
    payload: Record<string, any> = {},
    client?: PoolClient
  ): Promise<MemoryEventRow> {
    const sql = `
      INSERT INTO memory_events (company_id, event_type, payload, occurred_at)
      VALUES ($1, $2, $3::jsonb, NOW())
      RETURNING id, company_id, event_type, payload, occurred_at;
    `;
    try {
      const runner = this.getQueryRunner(client);
      const res = await runner.query(sql, [companyId, eventType, JSON.stringify(payload)]);
      return res.rows[0];
    } catch (err: any) {
      console.error(`[MemoryRepository.appendMemoryEvent] Error: ${err.message}`);
      throw new MemoryRepositoryError(`Failed to append memory event: ${err.message}`, err);
    }
  }

  /**
   * Inserts a message exchange into conversation_history table
   */
  public async appendConversation(
    data: AppendConversationData,
    client?: PoolClient
  ): Promise<ConversationHistoryRow> {
    const sql = `
      INSERT INTO conversation_history (
        lead_id, company_id, contact_id, channel, direction,
        sender_identity, recipient_identity, subject, body_text, message_metadata, sent_at
      )
      VALUES ($1, $2, $3, $4::conversation_channel, $5::message_direction, $6, $7, $8, $9, $10::jsonb, NOW())
      RETURNING id, lead_id, company_id, contact_id, channel, direction,
                sender_identity, recipient_identity, subject, body_text, message_metadata, sent_at;
    `;
    try {
      const runner = this.getQueryRunner(client);
      const res = await runner.query(sql, [
        data.leadId || null,
        data.companyId,
        data.contactId || null,
        data.channel,
        data.direction,
        data.senderIdentity,
        data.recipientIdentity,
        data.subject || null,
        data.bodyText,
        JSON.stringify(data.messageMetadata || {}),
      ]);
      return res.rows[0];
    } catch (err: any) {
      console.error(`[MemoryRepository.appendConversation] Error: ${err.message}`);
      throw new MemoryRepositoryError(`Failed to append conversation: ${err.message}`, err);
    }
  }

  /**
   * Inserts an interaction touchpoint into interaction_history table
   */
  public async appendInteraction(
    data: AppendInteractionData,
    client?: PoolClient
  ): Promise<InteractionHistoryRow> {
    const sql = `
      INSERT INTO interaction_history (lead_id, company_id, contact_id, interaction_type, payload, occurred_at)
      VALUES ($1, $2, $3, $4, $5::jsonb, NOW())
      RETURNING id, lead_id, company_id, contact_id, interaction_type, payload, occurred_at;
    `;
    try {
      const runner = this.getQueryRunner(client);
      const res = await runner.query(sql, [
        data.leadId || null,
        data.companyId,
        data.contactId || null,
        data.interactionType,
        JSON.stringify(data.payload || {}),
      ]);
      return res.rows[0];
    } catch (err: any) {
      console.error(`[MemoryRepository.appendInteraction] Error: ${err.message}`);
      throw new MemoryRepositoryError(`Failed to append interaction: ${err.message}`, err);
    }
  }

  /**
   * Retrieves paginated memory event history timeline for a company
   */
  public async getTimeline(
    companyId: string,
    options: TimelineFilterOptions = {}
  ): Promise<{ events: MemoryEventRow[]; total: number }> {
    const limit = Math.min(options.limit || 20, 100);
    const page = Math.max(options.page || 1, 1);
    const offset = (page - 1) * limit;

    const params: any[] = [companyId];
    let whereClause = 'WHERE company_id = $1';

    if (options.eventType) {
      params.push(options.eventType);
      whereClause += ` AND event_type = $${params.length}`;
    }

    if (options.startDate) {
      params.push(options.startDate);
      whereClause += ` AND occurred_at >= $${params.length}`;
    }

    if (options.endDate) {
      params.push(options.endDate);
      whereClause += ` AND occurred_at <= $${params.length}`;
    }

    const countSql = `SELECT COUNT(*) FROM memory_events ${whereClause};`;
    
    params.push(limit, offset);
    const dataSql = `
      SELECT id, company_id, event_type, payload, occurred_at
      FROM memory_events
      ${whereClause}
      ORDER BY occurred_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length};
    `;

    try {
      const countRes = await this.pool.query(countSql, params.slice(0, params.length - 2));
      const total = parseInt(countRes.rows[0].count, 10);
      const dataRes = await this.pool.query(dataSql, params);

      return { events: dataRes.rows, total };
    } catch (err: any) {
      console.error(`[MemoryRepository.getTimeline] Error: ${err.message}`);
      throw new MemoryRepositoryError(`Failed to fetch memory timeline: ${err.message}`, err);
    }
  }

  /**
   * Extracts hiring pattern JSONB field directly from company_memory
   */
  public async getHiringPatterns(companyId: string): Promise<HiringPatternData | null> {
    const sql = `
      SELECT memory->'hiring_patterns' AS hiring_patterns
      FROM company_memory
      WHERE company_id = $1;
    `;
    try {
      const res = await this.pool.query(sql, [companyId]);
      return res.rows.length > 0 ? res.rows[0].hiring_patterns : null;
    } catch (err: any) {
      console.error(`[MemoryRepository.getHiringPatterns] Error: ${err.message}`);
      throw new MemoryRepositoryError(`Failed to fetch hiring patterns: ${err.message}`, err);
    }
  }

  /**
   * Extracts reply sentiment summary JSONB field directly from company_memory
   */
  public async getReplySentimentHistory(companyId: string): Promise<ReplySentimentData | null> {
    const sql = `
      SELECT memory->'reply_sentiment_summary' AS reply_sentiment_summary
      FROM company_memory
      WHERE company_id = $1;
    `;
    try {
      const res = await this.pool.query(sql, [companyId]);
      return res.rows.length > 0 ? res.rows[0].reply_sentiment_summary : null;
    } catch (err: any) {
      console.error(`[MemoryRepository.getReplySentimentHistory] Error: ${err.message}`);
      throw new MemoryRepositoryError(`Failed to fetch reply sentiment: ${err.message}`, err);
    }
  }

  /**
   * Updates only hiring patterns sub-object inside company_memory JSONB
   */
  public async updateHiringPattern(
    companyId: string,
    patternData: Record<string, any>,
    expectedVersion: number
  ): Promise<CompanyMemoryRow> {
    const sql = `
      UPDATE company_memory
      SET memory = jsonb_set(memory, '{hiring_patterns}', $1::jsonb, true),
          version = version + 1,
          updated_at = NOW()
      WHERE company_id = $2 AND version = $3
      RETURNING id, company_id, memory, version, created_at, updated_at;
    `;
    try {
      const res = await this.pool.query(sql, [JSON.stringify(patternData), companyId, expectedVersion]);
      if (res.rows.length === 0) {
        throw new MemoryConcurrencyError(companyId, expectedVersion);
      }
      return res.rows[0];
    } catch (err: any) {
      if (err instanceof MemoryConcurrencyError) throw err;
      console.error(`[MemoryRepository.updateHiringPattern] Error: ${err.message}`);
      throw new MemoryRepositoryError(`Failed to update hiring pattern: ${err.message}`, err);
    }
  }

  /**
   * Updates reply sentiment sub-object inside company_memory JSONB
   */
  public async updateSentiment(
    companyId: string,
    sentimentData: Record<string, any>,
    expectedVersion: number
  ): Promise<CompanyMemoryRow> {
    const sql = `
      UPDATE company_memory
      SET memory = jsonb_set(memory, '{reply_sentiment_summary}', $1::jsonb, true),
          version = version + 1,
          updated_at = NOW()
      WHERE company_id = $2 AND version = $3
      RETURNING id, company_id, memory, version, created_at, updated_at;
    `;
    try {
      const res = await this.pool.query(sql, [JSON.stringify(sentimentData), companyId, expectedVersion]);
      if (res.rows.length === 0) {
        throw new MemoryConcurrencyError(companyId, expectedVersion);
      }
      return res.rows[0];
    } catch (err: any) {
      if (err instanceof MemoryConcurrencyError) throw err;
      console.error(`[MemoryRepository.updateSentiment] Error: ${err.message}`);
      throw new MemoryRepositoryError(`Failed to update sentiment: ${err.message}`, err);
    }
  }

  /**
   * Performs JSONB containment search on company_memory
   */
  public async searchMemory(options: MemorySearchOptions = {}): Promise<CompanyMemoryRow[]> {
    const limit = Math.min(options.limit || 10, 50);
    const offset = Math.max(options.offset || 0, 0);
    const jsonMatch = JSON.stringify(options.jsonbMatch || {});

    const sql = `
      SELECT id, company_id, memory, version, created_at, updated_at
      FROM company_memory
      WHERE memory @> $1::jsonb
      ORDER BY updated_at DESC
      LIMIT $2 OFFSET $3;
    `;
    try {
      const res = await this.pool.query(sql, [jsonMatch, limit, offset]);
      return res.rows;
    } catch (err: any) {
      console.error(`[MemoryRepository.searchMemory] Error: ${err.message}`);
      throw new MemoryRepositoryError(`Failed to search company memory: ${err.message}`, err);
    }
  }

  /**
   * Checks if memory record exists for company_id
   */
  public async memoryExists(companyId: string): Promise<boolean> {
    const sql = `SELECT 1 FROM company_memory WHERE company_id = $1 LIMIT 1;`;
    try {
      const res = await this.pool.query(sql, [companyId]);
      return res.rows.length > 0;
    } catch (err: any) {
      console.error(`[MemoryRepository.memoryExists] Error: ${err.message}`);
      throw new MemoryRepositoryError(`Failed to check memory existence: ${err.message}`, err);
    }
  }

  /**
   * Merges partial JSONB payload into existing company_memory JSONB object using PostgreSQL || operator
   */
  public async mergeMemory(
    companyId: string,
    partialMemory: Record<string, any>,
    expectedVersion: number
  ): Promise<CompanyMemoryRow> {
    const sql = `
      UPDATE company_memory
      SET memory = memory || $1::jsonb,
          version = version + 1,
          updated_at = NOW()
      WHERE company_id = $2 AND version = $3
      RETURNING id, company_id, memory, version, created_at, updated_at;
    `;
    try {
      const res = await this.pool.query(sql, [JSON.stringify(partialMemory), companyId, expectedVersion]);
      if (res.rows.length === 0) {
        throw new MemoryConcurrencyError(companyId, expectedVersion);
      }
      return res.rows[0];
    } catch (err: any) {
      if (err instanceof MemoryConcurrencyError) throw err;
      console.error(`[MemoryRepository.mergeMemory] Error: ${err.message}`);
      throw new MemoryRepositoryError(`Failed to merge company memory: ${err.message}`, err);
    }
  }

  /**
   * Fetches recent interaction touchpoints for a company
   */
  public async getRecentInteractions(companyId: string, limit: number = 10): Promise<InteractionHistoryRow[]> {
    const sql = `
      SELECT id, lead_id, company_id, contact_id, interaction_type, payload, occurred_at
      FROM interaction_history
      WHERE company_id = $1
      ORDER BY occurred_at DESC
      LIMIT $2;
    `;
    try {
      const res = await this.pool.query(sql, [companyId, Math.min(limit, 50)]);
      return res.rows;
    } catch (err: any) {
      console.error(`[MemoryRepository.getRecentInteractions] Error: ${err.message}`);
      throw new MemoryRepositoryError(`Failed to fetch recent interactions: ${err.message}`, err);
    }
  }

  /**
   * Fetches recent conversation messages for a company
   */
  public async getRecentConversations(companyId: string, limit: number = 10): Promise<ConversationHistoryRow[]> {
    const sql = `
      SELECT id, lead_id, company_id, contact_id, channel, direction,
             sender_identity, recipient_identity, subject, body_text, message_metadata, sent_at
      FROM conversation_history
      WHERE company_id = $1
      ORDER BY sent_at DESC
      LIMIT $2;
    `;
    try {
      const res = await this.pool.query(sql, [companyId, Math.min(limit, 50)]);
      return res.rows;
    } catch (err: any) {
      console.error(`[MemoryRepository.getRecentConversations] Error: ${err.message}`);
      throw new MemoryRepositoryError(`Failed to fetch recent conversations: ${err.message}`, err);
    }
  }

  /**
   * Fetches memory record along with recent audit events, interactions, and conversations for executive context compilation
   */
  public async getMemorySummary(
    companyId: string,
    options: { eventLimit?: number } = {}
  ): Promise<{
    memory: CompanyMemoryRow | null;
    recentEvents: MemoryEventRow[];
    recentInteractions: InteractionHistoryRow[];
    recentConversations: ConversationHistoryRow[];
  }> {
    const eventLimit = options.eventLimit || 5;

    try {
      const memory = await this.getMemoryByCompanyId(companyId);
      const recentEvents = (await this.getTimeline(companyId, { limit: eventLimit })).events;
      const recentInteractions = await this.getRecentInteractions(companyId, eventLimit);
      const recentConversations = await this.getRecentConversations(companyId, eventLimit);

      return {
        memory,
        recentEvents,
        recentInteractions,
        recentConversations,
      };
    } catch (err: any) {
      console.error(`[MemoryRepository.getMemorySummary] Error: ${err.message}`);
      throw new MemoryRepositoryError(`Failed to compile memory summary: ${err.message}`, err);
    }
  }
}
