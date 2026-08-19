import { FastifyRequest, FastifyReply } from 'fastify';
import {
  CompanyIdParams,
  CreateMemoryInput,
  UpdateMemoryInput,
  AddMemoryEventInput,
  TimelineQueryInput,
  SummaryQueryInput,
  AppendInteractionInput,
  AppendConversationInput,
  StandardEnvelope,
} from '../schemas/memory.schema';

/**
 * Interface definition for MemoryService to decouple controller from concrete implementation
 */
export interface IMemoryService {
  getCompanyMemory(companyId: string): Promise<any>;
  createCompanyMemory(input: CreateMemoryInput): Promise<any>;
  updateCompanyMemory(companyId: string, input: UpdateMemoryInput): Promise<any>;
  deleteCompanyMemory(companyId: string): Promise<void>;
  addMemoryEvent(companyId: string, input: AddMemoryEventInput): Promise<any>;
  getMemoryTimeline(companyId: string, query: TimelineQueryInput): Promise<any>;
  getHiringPatterns(companyId: string): Promise<any>;
  getReplySentiment(companyId: string): Promise<any>;
  appendInteraction(companyId: string, input: AppendInteractionInput): Promise<any>;
  appendConversation(companyId: string, input: AppendConversationInput): Promise<any>;
  refreshMemory(companyId: string): Promise<any>;
  getMemorySummary(companyId: string, query: SummaryQueryInput): Promise<any>;
}

/**
 * HireGen AI — Module 3.3 (AI Memory Subsystem)
 * Controller Layer
 *
 * Responsibilities:
 * 1. Extract and validate parameters, body, and query inputs via request wrapper.
 * 2. Delegate execution directly to the MemoryService layer (NO business logic or raw SQL).
 * 3. Wrap result in standard SRS JSON envelope: { success, data, error, meta }.
 * 4. Return appropriate HTTP status codes and handle errors gracefully.
 */
export class MemoryController {
  private memoryService: IMemoryService;

  constructor(service?: IMemoryService) {
    // Allows injection of mock services for unit testing or default instantiation
    if (service) {
      this.memoryService = service;
    } else {
      // Lazy load to prevent circular dependencies if service imports controller types
      const { MemoryService } = require('../services/memory.service');
      this.memoryService = new MemoryService();
    }
  }

  /**
   * Helper function to build SRS compliant response envelope
   */
  private sendEnvelope<T>(
    reply: FastifyReply,
    statusCode: number,
    success: boolean,
    data: T | null,
    error: string | null = null,
    requestId: string = 'req-unknown'
  ): void {
    const envelope: StandardEnvelope<T> = {
      success,
      data,
      error,
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    };
    reply.status(statusCode).send(envelope);
  }

  /**
   * GET /memory/:companyId
   * Retrieves full company memory profile
   */
  public getCompanyMemory = async (
    request: FastifyRequest<{ Params: CompanyIdParams }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const { companyId } = request.params;
      const memory = await this.memoryService.getCompanyMemory(companyId);
      
      if (!memory) {
        return this.sendEnvelope(reply, 404, false, null, `Memory profile for companyId '${companyId}' not found.`, request.id);
      }

      return this.sendEnvelope(reply, 200, true, memory, null, request.id);
    } catch (err: any) {
      request.log.error(`[MemoryController.getCompanyMemory] Error: ${err.message}`);
      return this.sendEnvelope(reply, 500, false, null, err.message || 'Internal server error', request.id);
    }
  };

  /**
   * POST /memory
   * Initializes a new company memory profile
   */
  public createCompanyMemory = async (
    request: FastifyRequest<{ Body: CreateMemoryInput }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const createdMemory = await this.memoryService.createCompanyMemory(request.body);
      return this.sendEnvelope(reply, 201, true, createdMemory, null, request.id);
    } catch (err: any) {
      request.log.error(`[MemoryController.createCompanyMemory] Error: ${err.message}`);
      const statusCode = err.message?.includes('already exists') ? 409 : 500;
      return this.sendEnvelope(reply, statusCode, false, null, err.message, request.id);
    }
  };

  /**
   * PATCH /memory/:companyId
   * Updates an existing memory profile (Optimistic concurrency versioning)
   */
  public updateCompanyMemory = async (
    request: FastifyRequest<{ Params: CompanyIdParams; Body: UpdateMemoryInput }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const { companyId } = request.params;
      const updatedMemory = await this.memoryService.updateCompanyMemory(companyId, request.body);
      return this.sendEnvelope(reply, 200, true, updatedMemory, null, request.id);
    } catch (err: any) {
      request.log.error(`[MemoryController.updateCompanyMemory] Error: ${err.message}`);
      const statusCode = err.message?.includes('Concurrency conflict') ? 409 : 500;
      return this.sendEnvelope(reply, statusCode, false, null, err.message, request.id);
    }
  };

  /**
   * DELETE /memory/:companyId
   * Purges company memory (Admin only)
   */
  public deleteCompanyMemory = async (
    request: FastifyRequest<{ Params: CompanyIdParams }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const { companyId } = request.params;
      await this.memoryService.deleteCompanyMemory(companyId);
      return this.sendEnvelope(reply, 200, true, { message: `Company memory ${companyId} deleted successfully.` }, null, request.id);
    } catch (err: any) {
      request.log.error(`[MemoryController.deleteCompanyMemory] Error: ${err.message}`);
      return this.sendEnvelope(reply, 500, false, null, err.message, request.id);
    }
  };

  /**
   * POST /memory/:companyId/events
   * Appends an audit event to the memory_events ledger
   */
  public addMemoryEvent = async (
    request: FastifyRequest<{ Params: CompanyIdParams; Body: AddMemoryEventInput }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const { companyId } = request.params;
      const eventResult = await this.memoryService.addMemoryEvent(companyId, request.body);
      return this.sendEnvelope(reply, 201, true, eventResult, null, request.id);
    } catch (err: any) {
      request.log.error(`[MemoryController.addMemoryEvent] Error: ${err.message}`);
      return this.sendEnvelope(reply, 500, false, null, err.message, request.id);
    }
  };

  /**
   * GET /memory/:companyId/timeline
   * Retrieves paginated event history timeline
   */
  public getMemoryTimeline = async (
    request: FastifyRequest<{ Params: CompanyIdParams; Querystring: TimelineQueryInput }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const { companyId } = request.params;
      const timeline = await this.memoryService.getMemoryTimeline(companyId, request.query);
      return this.sendEnvelope(reply, 200, true, timeline, null, request.id);
    } catch (err: any) {
      request.log.error(`[MemoryController.getMemoryTimeline] Error: ${err.message}`);
      return this.sendEnvelope(reply, 500, false, null, err.message, request.id);
    }
  };

  /**
   * GET /memory/:companyId/hiring-patterns
   * Extracts historical hiring pattern analytics
   */
  public getHiringPatterns = async (
    request: FastifyRequest<{ Params: CompanyIdParams }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const { companyId } = request.params;
      const patterns = await this.memoryService.getHiringPatterns(companyId);
      return this.sendEnvelope(reply, 200, true, patterns, null, request.id);
    } catch (err: any) {
      request.log.error(`[MemoryController.getHiringPatterns] Error: ${err.message}`);
      return this.sendEnvelope(reply, 500, false, null, err.message, request.id);
    }
  };

  /**
   * GET /memory/:companyId/sentiment
   * Fetches overall reply sentiment rating and historical response trend
   */
  public getReplySentiment = async (
    request: FastifyRequest<{ Params: CompanyIdParams }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const { companyId } = request.params;
      const sentiment = await this.memoryService.getReplySentiment(companyId);
      return this.sendEnvelope(reply, 200, true, sentiment, null, request.id);
    } catch (err: any) {
      request.log.error(`[MemoryController.getReplySentiment] Error: ${err.message}`);
      return this.sendEnvelope(reply, 500, false, null, err.message, request.id);
    }
  };

  /**
   * POST /memory/:companyId/interactions
   * Appends an interaction touchpoint (e.g. EMAIL_OPEN, LINK_CLICK)
   */
  public appendInteraction = async (
    request: FastifyRequest<{ Params: CompanyIdParams; Body: AppendInteractionInput }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const { companyId } = request.params;
      const result = await this.memoryService.appendInteraction(companyId, request.body);
      return this.sendEnvelope(reply, 201, true, result, null, request.id);
    } catch (err: any) {
      request.log.error(`[MemoryController.appendInteraction] Error: ${err.message}`);
      return this.sendEnvelope(reply, 500, false, null, err.message, request.id);
    }
  };

  /**
   * POST /memory/:companyId/conversations
   * Records a raw inbound/outbound conversation message
   */
  public appendConversation = async (
    request: FastifyRequest<{ Params: CompanyIdParams; Body: AppendConversationInput }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const { companyId } = request.params;
      const result = await this.memoryService.appendConversation(companyId, request.body);
      return this.sendEnvelope(reply, 201, true, result, null, request.id);
    } catch (err: any) {
      request.log.error(`[MemoryController.appendConversation] Error: ${err.message}`);
      return this.sendEnvelope(reply, 500, false, null, err.message, request.id);
    }
  };

  /**
   * POST /memory/:companyId/refresh
   * Invalidates Redis cache and forces a fresh context re-consolidation
   */
  public refreshMemory = async (
    request: FastifyRequest<{ Params: CompanyIdParams }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const { companyId } = request.params;
      const refreshedContext = await this.memoryService.refreshMemory(companyId);
      return this.sendEnvelope(reply, 200, true, refreshedContext, null, request.id);
    } catch (err: any) {
      request.log.error(`[MemoryController.refreshMemory] Error: ${err.message}`);
      return this.sendEnvelope(reply, 500, false, null, err.message, request.id);
    }
  };

  /**
   * GET /memory/:companyId/summary
   * Provides a consolidated executive context summary for AI Agents (Prompt Engine / Personalization Agent)
   */
  public getMemorySummary = async (
    request: FastifyRequest<{ Params: CompanyIdParams; Querystring: SummaryQueryInput }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const { companyId } = request.params;
      const summary = await this.memoryService.getMemorySummary(companyId, request.query);
      return this.sendEnvelope(reply, 200, true, summary, null, request.id);
    } catch (err: any) {
      request.log.error(`[MemoryController.getMemorySummary] Error: ${err.message}`);
      return this.sendEnvelope(reply, 500, false, null, err.message, request.id);
    }
  };
}
