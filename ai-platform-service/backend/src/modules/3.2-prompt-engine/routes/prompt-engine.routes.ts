import { FastifyInstance } from "fastify";
import { PromptEngineController } from "../controllers/prompt-engine.controller";

export async function promptEngineRoutes(
  fastify: FastifyInstance,
  controller: PromptEngineController,
): Promise<void> {
  fastify.post(
    "/api/v1/prompt-engine/render",
    {
      // Request validation is performed by PromptEngineService via Zod.
      // Shared auth/RBAC hooks can be attached by the host application.
    },
    (request, reply) => controller.render(request, reply),
  );
}
