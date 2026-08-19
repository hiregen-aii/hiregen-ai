import assert from "node:assert/strict";
import { AIGateway } from "../src/modules/3.1-ai-gateway/ai-gateway";
import type { AIProvider } from "../src/modules/3.1-ai-gateway/types";
import { InMemoryPromptTemplateRepository } from "../src/modules/3.2-prompt-engine/repositories/in-memory-prompt-template.repository";
import { PromptEngineService } from "../src/modules/3.2-prompt-engine/services/prompt-engine.service";
import { MemoryService } from "../src/modules/3.3-ai-memory/services/memory.service";
import { PersonalizationAgent, type AIJsonClient, type ApprovalQueueWriter, type LeadStageWriter, type AgentRunWriter } from "../src/modules/3.4-personalization/agents/personalization.agent";
import { InMemoryTemplateRepository } from "../src/integration/adapters/in-memory-template.repository";
import { InMemoryMemoryRepository } from "../src/integration/adapters/in-memory-memory.repository";
import { InMemoryFollowUpRepository, seedEligibleLead } from "../src/integration/adapters/in-memory-followup.repository";
import { FollowUpAgent } from "../src/modules/3.5-followup/agents/followup.agent";
import { AnalyticsService } from "../src/modules/3.6-analytics/services/analytics.service";
import { InMemoryAnalyticsRepository } from "../src/integration/adapters/in-memory-analytics.repository";
import { personalizationTemplate, promptTemplate, IDS } from "../src/integration/seed";

const mockProvider: AIProvider = {
  async generate(req) {
    return { provider: "gemini", model: "mock-gemini", content: JSON.stringify({ research_insight: "Hiring backend engineers is a current priority.", value_prop: "We can help accelerate qualified engineering hiring.", prior_context: null, confidence: "high", grounding_notes: "Based on supplied research." }), responseTimeMs: 5, tokenUsage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 } };
  },
};

const failingProvider: AIProvider = { async generate() { throw new Error("mock primary failure"); } };

async function main() {
  // 3.6 receives execution logs from 3.1 without 3.1 depending on the DB.
  const analyticsRepo = new InMemoryAnalyticsRepository();
  const analytics = new AnalyticsService(analyticsRepo as any);

  const gateway = new AIGateway(
    (log) => analytics.recordGatewayRun(log),
    { groq: failingProvider, gemini: mockProvider },
  );

  // 3.2 renders a versioned prompt.
  const promptRepo = new InMemoryPromptTemplateRepository();
  await promptRepo.saveTemplate(promptTemplate);
  const promptService = new PromptEngineService(promptRepo);
  const rendered = await promptService.renderPrompt({
    templateId: promptTemplate.id,
    agentName: "personalization",
    variables: {
      company_name: "Acme",
      contact_name: "Rahul",
      role_title: "Backend Engineer",
      research_summary: "Acme is expanding its backend team.",
    },
  });
  assert.equal(rendered.metadata.promptVersion, 1);
  assert.match(rendered.renderedPrompt, /Rahul/);

  // 3.2 -> 3.1 -> 3.6: fallback works and metadata survives into the Gateway log.
  const gatewayResponse = await gateway.generate({
    agent: "personalization",
    prompt: rendered.renderedPrompt,
    metadata: rendered.metadata,
  });
  assert.equal(gatewayResponse.provider, "gemini");
  assert.equal(analyticsRepo.runs.length, 1);
  assert.equal(analyticsRepo.runs[0].agentName, "personalization");

  // 3.3 -> 3.4: memory can be created/merged and supplied as personalization context.
  const memoryRepo = new InMemoryMemoryRepository();
  const memoryService = new MemoryService(memoryRepo);
  const memory = await memoryService.createCompanyMemory({ companyId: IDS.company });
  const merged = await memoryService.mergeMemory(IDS.company, { lastResearchSummary: "Acme is hiring backend engineers.", lastResearchAt: new Date().toISOString() }, memory.version);
  assert.equal(merged.memory.lastResearchSummary, "Acme is hiring backend engineers.");

  const templateRepo = new InMemoryTemplateRepository();
  await templateRepo.seed(personalizationTemplate);
  const approvalQueue: ApprovalQueueWriter = {
    async createDraft(input) { return { id: crypto.randomUUID(), ...input }; },
  };
  const leads: LeadStageWriter = { async markOutreachDrafted() {} };
  const agentRuns: AgentRunWriter = { async logRun() {} };
  const aiClient: AIJsonClient = {
    async generateJSON(input) {
      const ai = await gateway.generate({ agent: "personalization", prompt: `${input.systemPrompt}\n${input.userPrompt}` });
      return JSON.parse(ai.content);
    },
  };
  const personalization = new PersonalizationAgent({
    templates: new (require("../src/modules/3.4-personalization/services/template.service").TemplateService)(templateRepo),
    ai: aiClient,
    approvalQueue,
    leads,
    agentRuns,
  });
  const draft = await personalization.draft({
    lead_id: IDS.lead,
    company_id: IDS.company,
    hiring_type: "FULL_TIME",
    step_number: 1,
    urgency: "HIGH",
    fit_score: 85,
    role_title: "Backend Engineer",
    contact_name: "Rahul",
    company_name: "Acme",
    sender_name: "Ansh",
    research_summary: merged.memory.lastResearchSummary,
    company_memory_json: merged.memory,
    campaign_value_props: "Accelerate engineering hiring",
  });
  assert.match(draft.body, /Rahul/);
  assert.doesNotMatch(draft.body, /\{\{/);

  // 3.5 follow-up decision is independently testable and consumes research/memory context.
  const followupRepo = new InMemoryFollowUpRepository();
  seedEligibleLead(followupRepo, IDS.lead, IDS.campaign, IDS.company);
  followupRepo.memory = merged.memory;
  const followup = new FollowUpAgent(followupRepo);
  const decision = await followup.runFollowUpAgent({ lead_id: IDS.lead, campaign_id: IDS.campaign, current_step: 1, days_between_followups: 7, max_steps: 3 });
  assert.equal(decision.should_generate, true);
  assert.equal(decision.next_step, 2);

  const daily = await analytics.getDailyAnalytics(new Date().toISOString().slice(0, 10));
  assert.equal(daily.metrics.totalAiRuns, 2); // 3.2 gateway call + 3.4 gateway call

  console.log("TEAM 3 INTEGRATION SMOKE TEST: PASS");
  console.log(JSON.stringify({
    modules: ["3.1", "3.2", "3.3", "3.4", "3.5", "3.6"],
    gatewayProvider: gatewayResponse.provider,
    promptVersion: rendered.metadata.promptVersion,
    analyticsRuns: analyticsRepo.runs.length,
    followupStep: decision.next_step,
    personalizationDraftCreated: Boolean(draft.approvalDraft.id),
  }, null, 2));
}

main().catch((error) => { console.error(error); process.exit(1); });
