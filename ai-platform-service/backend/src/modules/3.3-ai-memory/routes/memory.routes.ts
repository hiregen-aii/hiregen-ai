import { FastifyInstance, FastifyPluginOptions, FastifyPluginAsync, FastifySchema } from 'fastify';
import { MemoryController } from '../controllers/memory.controller';
import {
  companyIdParamsSchema,
  createMemorySchema,
  updateMemorySchema,
  memoryEventSchema,
  interactionSchema,
  conversationSchema,
  timelineQuerySchema,
  summaryQuerySchema,
} from '../schemas/memory.schema';

/**
 * HireGen AI — Module 3.3 (AI Memory Subsystem)
 * Fastify Routes Plugin
 *
 * Registers the 12 memory API endpoints, binding Zod schema validators,
 * JWT authentication hooks, and RBAC authorization checks per SRS Section 13.
 */

// Interface extension to support OpenAPI/Swagger documentation metadata fields on Fastify schemas
interface ExtendedFastifySchema extends FastifySchema {
  description?: string;
  tags?: string[];
  summary?: string;
}

// Helper middleware to sanitize Zod errors into standard SRS validation responses
const validateZod = (schema: { params?: any; body?: any; query?: any }) => {
  return async (request: any, reply: any) => {
    try {
      if (schema.params) {
        request.params = schema.params.parse(request.params || {});
      }
      if (schema.body) {
        request.body = schema.body.parse(request.body);
      }
      if (schema.query) {
        request.query = schema.query.parse(request.query || {});
      }
    } catch (err: any) {
      const errorMessage = err.errors
        ? err.errors.map((e: any) => `${e.path.join('.') || 'body'}: ${e.message}`).join('; ')
        : err.message;
      return reply.status(400).send({
        success: false,
        data: null,
        error: `Validation error: ${errorMessage}`,
        meta: {
          requestId: request.id || 'req-unknown',
          timestamp: new Date().toISOString(),
        },
      });
    }
  };
};

/**
 * Authentication Middleware Hook
 */
const authenticateJWT = async (request: any, reply: any) => {
  if (request.jwtVerify) {
    try {
      await request.jwtVerify();
    } catch (err: any) {
      return reply.status(401).send({
        success: false,
        data: null,
        error: `Unauthorized: ${err.message}`,
        meta: {
          requestId: request.id || 'req-unknown',
          timestamp: new Date().toISOString(),
        },
      });
    }
  } else if (!request.headers.authorization && !request.headers['x-api-key']) {
    request.log.warn('[Auth] No authorization header present');
  }
};

/**
 * RBAC Role Authorization Middleware Hook
 */
const authorizeRoles = (allowedRoles: string[]) => {
  return async (request: any, reply: any) => {
    const userRole = request.user?.role || request.headers['x-user-role'] || 'SALES_REP';
    if (!allowedRoles.includes(userRole) && !allowedRoles.includes('ALL')) {
      return reply.status(403).send({
        success: false,
        data: null,
        error: `Forbidden: User role '${userRole}' lacks permission to execute this operation. Allowed roles: [${allowedRoles.join(', ')}]`,
        meta: {
          requestId: request.id || 'req-unknown',
          timestamp: new Date().toISOString(),
        },
      });
    }
  };
};

export const memoryRoutes: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  options: FastifyPluginOptions
): Promise<void> => {
  const controller = new MemoryController();

  // Route 1: GET /memory/:companyId
  fastify.get(
    '/memory/:companyId',
    {
      preHandler: [
        authenticateJWT,
        authorizeRoles(['ADMIN', 'MANAGER', 'SALES_REP', 'RECRUITER', 'VIEWER']),
        validateZod({ params: companyIdParamsSchema }),
      ],
      schema: {
        description: 'Get full persistent company memory profile',
        tags: ['AI Memory'],
      } as ExtendedFastifySchema,
    },
    controller.getCompanyMemory
  );

  // Route 2: POST /memory
  fastify.post(
    '/memory',
    {
      preHandler: [
        authenticateJWT,
        authorizeRoles(['ADMIN', 'MANAGER', 'SALES_REP']),
        validateZod({ body: createMemorySchema }),
      ],
      schema: {
        description: 'Initialize a new company memory profile',
        tags: ['AI Memory'],
      } as ExtendedFastifySchema,
    },
    controller.createCompanyMemory
  );

  // Route 3: PATCH /memory/:companyId
  fastify.patch(
    '/memory/:companyId',
    {
      preHandler: [
        authenticateJWT,
        authorizeRoles(['ADMIN', 'MANAGER', 'SALES_REP']),
        validateZod({ params: companyIdParamsSchema, body: updateMemorySchema }),
      ],
      schema: {
        description: 'Update existing memory profile with optimistic concurrency versioning',
        tags: ['AI Memory'],
      } as ExtendedFastifySchema,
    },
    controller.updateCompanyMemory
  );

  // Route 4: DELETE /memory/:companyId
  fastify.delete(
    '/memory/:companyId',
    {
      preHandler: [
        authenticateJWT,
        authorizeRoles(['ADMIN']),
        validateZod({ params: companyIdParamsSchema }),
      ],
      schema: {
        description: 'Purge company memory (Admin only)',
        tags: ['AI Memory'],
      } as ExtendedFastifySchema,
    },
    controller.deleteCompanyMemory
  );

  // Route 5: POST /memory/:companyId/events
  fastify.post(
    '/memory/:companyId/events',
    {
      preHandler: [
        authenticateJWT,
        authorizeRoles(['ADMIN', 'MANAGER', 'SALES_REP', 'RECRUITER']),
        validateZod({ params: companyIdParamsSchema, body: memoryEventSchema }),
      ],
      schema: {
        description: 'Append an audit event to the memory_events ledger',
        tags: ['AI Memory'],
      } as ExtendedFastifySchema,
    },
    controller.addMemoryEvent
  );

  // Route 6: GET /memory/:companyId/timeline
  fastify.get(
    '/memory/:companyId/timeline',
    {
      preHandler: [
        authenticateJWT,
        authorizeRoles(['ADMIN', 'MANAGER', 'SALES_REP', 'RECRUITER', 'VIEWER']),
        validateZod({ params: companyIdParamsSchema, query: timelineQuerySchema }),
      ],
      schema: {
        description: 'Get paginated memory event history timeline',
        tags: ['AI Memory'],
      } as ExtendedFastifySchema,
    },
    controller.getMemoryTimeline
  );

  // Route 7: GET /memory/:companyId/hiring-patterns
  fastify.get(
    '/memory/:companyId/hiring-patterns',
    {
      preHandler: [
        authenticateJWT,
        authorizeRoles(['ADMIN', 'MANAGER', 'SALES_REP', 'RECRUITER', 'VIEWER']),
        validateZod({ params: companyIdParamsSchema }),
      ],
      schema: {
        description: 'Get company historical hiring pattern analytics',
        tags: ['AI Memory'],
      } as ExtendedFastifySchema,
    },
    controller.getHiringPatterns
  );

  // Route 8: GET /memory/:companyId/sentiment
  fastify.get(
    '/memory/:companyId/sentiment',
    {
      preHandler: [
        authenticateJWT,
        authorizeRoles(['ADMIN', 'MANAGER', 'SALES_REP', 'RECRUITER', 'VIEWER']),
        validateZod({ params: companyIdParamsSchema }),
      ],
      schema: {
        description: 'Get overall reply sentiment rating and historical response trend',
        tags: ['AI Memory'],
      } as ExtendedFastifySchema,
    },
    controller.getReplySentiment
  );

  // Route 9: POST /memory/:companyId/interactions
  fastify.post(
    '/memory/:companyId/interactions',
    {
      preHandler: [
        authenticateJWT,
        authorizeRoles(['ADMIN', 'MANAGER', 'SALES_REP', 'RECRUITER']),
        validateZod({ params: companyIdParamsSchema, body: interactionSchema }),
      ],
      schema: {
        description: 'Append an interaction touchpoint (opens, clicks, bounces)',
        tags: ['AI Memory'],
      } as ExtendedFastifySchema,
    },
    controller.appendInteraction
  );

  // Route 10: POST /memory/:companyId/conversations
  fastify.post(
    '/memory/:companyId/conversations',
    {
      preHandler: [
        authenticateJWT,
        authorizeRoles(['ADMIN', 'MANAGER', 'SALES_REP', 'RECRUITER']),
        validateZod({ params: companyIdParamsSchema, body: conversationSchema }),
      ],
      schema: {
        description: 'Record an inbound/outbound conversation message',
        tags: ['AI Memory'],
      } as ExtendedFastifySchema,
    },
    controller.appendConversation
  );

  // Route 11: POST /memory/:companyId/refresh
  fastify.post(
    '/memory/:companyId/refresh',
    {
      preHandler: [
        authenticateJWT,
        authorizeRoles(['ADMIN', 'MANAGER', 'SALES_REP']),
        validateZod({ params: companyIdParamsSchema }),
      ],
      schema: {
        description: 'Invalidate Redis cache and force fresh context re-consolidation',
        tags: ['AI Memory'],
      } as ExtendedFastifySchema,
    },
    controller.refreshMemory
  );

  // Route 12: GET /memory/:companyId/summary
  fastify.get(
    '/memory/:companyId/summary',
    {
      preHandler: [
        authenticateJWT,
        authorizeRoles(['ADMIN', 'MANAGER', 'SALES_REP', 'RECRUITER', 'VIEWER']),
        validateZod({ params: companyIdParamsSchema, query: summaryQuerySchema }),
      ],
      schema: {
        description: 'Get consolidated context summary for AI Agent prompts',
        tags: ['AI Memory'],
      } as ExtendedFastifySchema,
    },
    controller.getMemorySummary
  );
};

export default memoryRoutes;
