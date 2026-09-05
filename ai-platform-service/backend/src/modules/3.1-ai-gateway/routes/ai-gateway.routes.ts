// FIX (Team 2 <-> Team 3 integration): AIGateway existed as a class with a
// generate() method, but no HTTP route exposed it anywhere — server.ts
// only wired up prompt-engine (3.2) and analytics (3.6). Team 2's Research
// Agent (2.4) currently calls Groq/OpenAI directly as a placeholder;
// this route is what it should call instead once wired, so model
// routing/fallback/cost-tracking go through one place instead of every
// team re-implementing their own provider calls.
//
// Internal service-to-service route, not user-facing — no JWT here by
// design (Team 2's Node process calls this directly, not a browser).
// If this ever needs to cross a real network boundary (not just
// localhost), add a shared-secret header check same as
// verifyWebhookSignature.js does for n8n on the Team 2 side.

import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { AIGateway, GatewayLoggingHook } from "../ai-gateway";
import { AgentType } from "../types";

interface GenerateBody {
  agent?: AgentType;
  prompt?: string;
  metadata?: {
    templateId?: string;
    promptVersion?: number;
    leadId?: string;
    inputHash?: string;
  };
}

export async function aiGatewayRoutes(
  fastify: FastifyInstance,
  gateway: AIGateway,
): Promise<void> {
  fastify.post(
    "/internal/ai-gateway/generate",
    async (request: FastifyRequest<{ Body: GenerateBody }>, reply: FastifyReply) => {
      const { agent, prompt, metadata } = request.body || {};

      if (!agent || !prompt) {
        return reply.code(400).send({
          success: false,
          data: null,
          error: { message: "agent and prompt are required." },
        });
      }

      try {
        const result = await gateway.generate({ agent, prompt, metadata });
        return reply.send({ success: true, data: result, error: null });
      } catch (err) {
        const message = err instanceof Error ? err.message : "AI Gateway request failed.";
        // All providers failing is a legitimate operational outcome (rate
        // limits, provider outage), not a 500 — 502 signals "upstream
        // dependency failed" to whoever's calling this (Team 2's Research
        // Agent), which already has its own retry/error-surfacing logic.
        return reply.code(502).send({ success: false, data: null, error: { message } });
      }
    },
  );
}

// Convenience factory so server.ts doesn't need to know about
// GatewayLoggingHook wiring details.
export function buildAiGateway(loggingHook?: GatewayLoggingHook): AIGateway {
  return new AIGateway(loggingHook);
}
