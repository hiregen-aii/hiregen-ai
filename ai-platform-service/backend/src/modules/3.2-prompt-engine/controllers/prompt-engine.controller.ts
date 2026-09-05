import { FastifyReply, FastifyRequest } from "fastify";
import { PromptEngineService } from "../services/prompt-engine.service";
import { RenderPromptRequest } from "../types/prompt-engine.types";

export class PromptEngineController {
  constructor(private readonly promptEngineService: PromptEngineService) {}

  async render(request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await this.promptEngineService.renderPrompt(request.body as RenderPromptRequest);
      return reply.code(200).send({
        success: true,
        data: result,
        error: null,
        meta: { requestId: request.id },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Prompt rendering failed";
      const mapping: Record<string, { status: number; code: string }> = {
        "Prompt template not found": { status: 404, code: "PROMPT_TEMPLATE_NOT_FOUND" },
        "Prompt template is inactive": { status: 400, code: "PROMPT_TEMPLATE_INACTIVE" },
        "Required prompt variable missing": { status: 400, code: "PROMPT_VARIABLE_MISSING" },
        "Prompt variable not provided": { status: 400, code: "PROMPT_VARIABLE_MISSING" },
        "Prompt references undeclared variable": { status: 400, code: "PROMPT_TEMPLATE_INVALID" },
        "Rendered prompt contains unresolved variables": { status: 400, code: "PROMPT_TEMPLATE_INVALID" },
      };
      const match = Object.entries(mapping).find(([prefix]) => message.includes(prefix));
      const status = match?.[1].status ?? 500;
      const code = match?.[1].code ?? "PROMPT_ENGINE_ERROR";

      return reply.code(status).send({
        success: false,
        data: null,
        error: { code, message: status === 500 ? "Prompt rendering failed" : message },
        meta: { requestId: request.id },
      });
    }
  }
}
