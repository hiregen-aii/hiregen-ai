import Fastify from "fastify";
import { InMemoryPromptTemplateRepository } from "./modules/3.2-prompt-engine/repositories/in-memory-prompt-template.repository";
import { PromptEngineService } from "./modules/3.2-prompt-engine/services/prompt-engine.service";
import { PromptEngineController } from "./modules/3.2-prompt-engine/controllers/prompt-engine.controller";
import { promptEngineRoutes } from "./modules/3.2-prompt-engine/routes/prompt-engine.routes";
import { AnalyticsService } from "./modules/3.6-analytics/services/analytics.service";
import { analyticsRoutes } from "./modules/3.6-analytics/routes/analytics.routes";
import { InMemoryAnalyticsRepository } from "./integration/adapters/in-memory-analytics.repository";
import { promptTemplate } from "./integration/seed";
import { aiGatewayRoutes, buildAiGateway } from "./modules/3.1-ai-gateway/routes/ai-gateway.routes";

export async function buildApp() {
  const app = Fastify({ logger: false });

  const promptRepo = new InMemoryPromptTemplateRepository();
  await promptRepo.saveTemplate(promptTemplate);
  const promptService = new PromptEngineService(promptRepo);
  const promptController = new PromptEngineController(promptService);
  await promptEngineRoutes(app, promptController);

  const analyticsRepo = new InMemoryAnalyticsRepository();
  const analyticsService = new AnalyticsService(analyticsRepo as any);
  await analyticsRoutes(app, analyticsService);

  // FIX: AI Gateway (3.1) had no HTTP route — only prompt-engine and
  // analytics were wired here before. This is what Team 2's Research
  // Agent should call instead of hitting Groq/OpenAI directly.
  const aiGateway = buildAiGateway();
  await aiGatewayRoutes(app, aiGateway);

  app.get("/health", async () => ({ success: true, data: { service: "team3-integrated", modules: ["3.1", "3.2", "3.3", "3.4", "3.5", "3.6"] }, error: null }));
  return app;
}

if (require.main === module) {
  // FIX: default port 3000 collided with Team 2's server (same default).
  // Team 3's service now defaults to 3100 so both can run side by side
  // locally without one failing to bind. Override with PORT env var either
  // way.
  buildApp().then((app) => app.listen({ port: Number(process.env.PORT || 3100), host: "0.0.0.0" }));
}
