import type { IMemoryRepository, CompanyMemoryRow, MemoryEventRow, ConversationHistoryRow, InteractionHistoryRow, TimelineFilterOptions, MemorySearchOptions, HiringPatternData, ReplySentimentData, AppendConversationData, AppendInteractionData } from "../../modules/3.3-ai-memory/repositories/memory.repository";

export class InMemoryMemoryRepository implements IMemoryRepository {
  private readonly memories = new Map<string, CompanyMemoryRow>();
  private readonly events: MemoryEventRow[] = [];
  private readonly conversations: ConversationHistoryRow[] = [];
  private readonly interactions: InteractionHistoryRow[] = [];

  async createMemory(companyId: string, initialMemory: Record<string, any> = {}): Promise<CompanyMemoryRow> { const now = new Date(); const row: CompanyMemoryRow = { id: crypto.randomUUID(), company_id: companyId, memory: structuredClone(initialMemory), version: 1, created_at: now, updated_at: now }; this.memories.set(companyId, row); return row; }
  async getMemoryByCompanyId(companyId: string): Promise<CompanyMemoryRow | null> { return this.memories.get(companyId) ?? null; }
  async updateMemory(companyId: string, memoryData: Record<string, any>, expectedVersion: number): Promise<CompanyMemoryRow> { const row = this.memories.get(companyId); if (!row || row.version !== expectedVersion) throw new Error("Concurrency Conflict"); const next = { ...row, memory: structuredClone(memoryData), version: row.version + 1, updated_at: new Date() }; this.memories.set(companyId, next); return next; }
  async mergeMemory(companyId: string, partialMemory: Record<string, any>, expectedVersion: number): Promise<CompanyMemoryRow> { const row = this.memories.get(companyId); if (!row) throw new Error("Memory not found"); return this.updateMemory(companyId, deepMerge(row.memory, partialMemory), expectedVersion); }
  async deleteMemory(companyId: string): Promise<boolean> { return this.memories.delete(companyId); }
  async appendMemoryEvent(companyId: string, eventType: string, payload: Record<string, any>): Promise<MemoryEventRow> { const row: MemoryEventRow = { id: crypto.randomUUID(), company_id: companyId, event_type: eventType, payload, occurred_at: new Date() }; this.events.push(row); return row; }
  async appendConversation(data: AppendConversationData): Promise<ConversationHistoryRow> { const row: ConversationHistoryRow = { id: crypto.randomUUID(), lead_id: data.leadId ?? null, company_id: data.companyId, contact_id: data.contactId ?? null, channel: data.channel, direction: data.direction, sender_identity: data.senderIdentity, recipient_identity: data.recipientIdentity, subject: data.subject ?? null, body_text: data.bodyText, message_metadata: data.messageMetadata ?? {}, sent_at: new Date() }; this.conversations.push(row); return row; }
  async appendInteraction(data: AppendInteractionData): Promise<InteractionHistoryRow> { const row: InteractionHistoryRow = { id: crypto.randomUUID(), lead_id: data.leadId ?? null, company_id: data.companyId, contact_id: data.contactId ?? null, interaction_type: data.interactionType, payload: data.payload ?? {}, occurred_at: new Date() }; this.interactions.push(row); return row; }
  async getTimeline(companyId: string, options: TimelineFilterOptions = {}) { const filtered = this.events.filter((e) => e.company_id === companyId).slice(0, options.limit ?? 20); return { events: filtered, total: filtered.length }; }
  async getHiringPatterns(companyId: string): Promise<HiringPatternData | null> { const row = this.memories.get(companyId); return row?.memory?.hiring_patterns ?? null; }
  async getReplySentimentHistory(companyId: string): Promise<ReplySentimentData | null> { const row = this.memories.get(companyId); return row?.memory?.reply_sentiment_summary ?? null; }
  async updateHiringPattern(companyId: string, patternData: Record<string, any>, expectedVersion: number) { return this.mergeMemory(companyId, { hiring_patterns: patternData }, expectedVersion); }
  async updateSentiment(companyId: string, sentimentData: Record<string, any>, expectedVersion: number) { return this.mergeMemory(companyId, { reply_sentiment_summary: sentimentData }, expectedVersion); }
  async searchMemory(options: MemorySearchOptions): Promise<CompanyMemoryRow[]> { return [...this.memories.values()].filter((r) => !options.jsonbMatch || Object.entries(options.jsonbMatch).every(([k, v]) => r.memory[k] === v)).slice(options.offset ?? 0, (options.offset ?? 0) + (options.limit ?? 50)); }
  async memoryExists(companyId: string): Promise<boolean> { return this.memories.has(companyId); }
  async getRecentInteractions(companyId: string, limit = 10) { return this.interactions.filter((i) => i.company_id === companyId).slice(-limit).reverse(); }
  async getRecentConversations(companyId: string, limit = 10) { return this.conversations.filter((i) => i.company_id === companyId).slice(-limit).reverse(); }
  async getMemorySummary(companyId: string, options: { eventLimit?: number } = {}) { return { memory: await this.getMemoryByCompanyId(companyId), recentEvents: this.events.filter((e) => e.company_id === companyId).slice(-(options.eventLimit ?? 5)).reverse(), recentInteractions: await this.getRecentInteractions(companyId), recentConversations: await this.getRecentConversations(companyId) }; }
  async executeTransaction<T>(fn: (client: any) => Promise<T>): Promise<T> { return fn({}); }
}

function deepMerge(base: Record<string, any>, patch: Record<string, any>): Record<string, any> { const out = structuredClone(base); for (const [key, value] of Object.entries(patch)) { if (value && typeof value === "object" && !Array.isArray(value) && out[key] && typeof out[key] === "object" && !Array.isArray(out[key])) out[key] = deepMerge(out[key], value); else out[key] = structuredClone(value); } return out; }
