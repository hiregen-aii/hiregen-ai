// Team 2 (2.4 Research Engine)
// IMPORTANT: every output MUST include source_urls for verification.

const crypto = require("crypto");
const { z } = require("zod");

const {
  getCompanyById,
} = require("../repositories/companies.repository");

const {
  getHiringSignalById,
} = require("../repositories/hiringSignals.repository");

const {
  getLeadById,
} = require("../repositories/leads.repository");

const {
  createAgentRun,
  updateAgentRun,
} = require("../repositories/agentRuns.repository");

const {
  getCompanyMemoryByCompany,
  createCompanyMemory,
  updateCompanyMemory,
} = require("../repositories/companyMemory.repository");

const {
  upsertResearch,
} = require("../repositories/companyResearch.repository");

const { callAiGateway } = require("../services/aiGateway.service");
const { validateAndExtractSources } = require("../services/sourceValidator.service");

const AGENT_NAME = "research_agent";

// A memory record older than this is treated as stale — fresh research
// should be triggered instead of reusing it.
const MEMORY_STALE_AFTER_DAYS = 30;

// Sources are already checked upstream for hallucinated/zero-source output;
// this schema is the last gate before anything reaches the database.
const validatedResearchSchema = z.object({
  status: z.literal("SUCCESS"),
  summary: z.string().min(1, "summary is required"),
  sources: z
    .array(
      z.object({
        url: z.string().url(),
        supports: z.string().optional().default(""),
      })
    )
    .min(1, "at least one verified source is required"),
});

function isOlderThanDays(dateValue, days) {
  if (!dateValue) return true;
  const ageMs = Date.now() - new Date(dateValue).getTime();
  return ageMs > days * 24 * 60 * 60 * 1000;
}

// --------------------
// company_memory lookup
// --------------------
async function getMemoryContext(companyId) {
  const memories = await getCompanyMemoryByCompany(companyId);
  const hasMemory = Array.isArray(memories) && memories.length > 0;

  const latest = hasMemory
    ? memories.reduce((a, b) =>
        new Date(a.updated_at || a.created_at) > new Date(b.updated_at || b.created_at) ? a : b
      )
    : null;

  const lastResearchedAt = latest ? latest.updated_at || latest.created_at : null;

  // FIX: memory is now a JSONB object (migration 003), not a plain string
  // — read the specific field this agent wrote instead of the whole blob,
  // so other agents' keys (sentiment, outreach history, etc.) in the same
  // record don't leak into the research prompt.
  const priorSummary =
    latest && latest.memory && typeof latest.memory === "object"
      ? latest.memory.lastResearchSummary || null
      : null;

  return {
    hasMemory,
    needsFreshResearch: !latest || isOlderThanDays(lastResearchedAt, MEMORY_STALE_AFTER_DAYS),
    priorResearchSummary: priorSummary,
    lastResearchedAt,
  };
}

// --------------------
// Prompt assembly
// Role/hiring-type/source_url live on a hiring_signal, not on the company
// record itself, so this needs both inputs. Plain string building only —
// no provider-specific code, so this stays provider-agnostic.
// --------------------
function assembleResearchPrompt(company, hiringSignal, memoryContext) {
  let prompt = `Company: ${company.name} (${company.domain})
Industry: ${company.industry} | Size: ${company.size_range}
Hiring for: ${hiringSignal.role_title} (${hiringSignal.hiring_type})
Original posting: ${hiringSignal.source_url}`;

  if (memoryContext.priorResearchSummary) {
    prompt += `\nPrior research on file (from ${memoryContext.lastResearchedAt}): ${memoryContext.priorResearchSummary}
Update or extend this rather than starting from scratch.`;
  }

  prompt += `\n\nWrite a 4-6 sentence research brief covering: what ${company.name} does, why this hiring need makes sense given their business, and any recent context. Cite a source for each factual claim.`;

  return prompt;
}

async function runResearchAgent(companyId, hiringSignalId) {
  const company = await getCompanyById(companyId);
  if (!company) {
    throw new Error("Company not found");
  }

  const hiringSignal = await getHiringSignalById(hiringSignalId);
  if (!hiringSignal) {
    throw new Error("Hiring signal not found");
  }
  if (hiringSignal.company_id !== companyId) {
    throw new Error("Hiring signal does not belong to this company");
  }

  const memoryContext = await getMemoryContext(companyId);
  const prompt = assembleResearchPrompt(company, hiringSignal, memoryContext);

  return {
    company,
    hiringSignal,
    ...memoryContext,
    prompt,
  };
}

// --------------------
// Storage & Memory Integration
// Receives the validated research output, re-validates it, writes
// company_research, then updates company_memory in the same flow.
// --------------------
async function saveValidatedResearch(companyId, rawValidatedResearch, modelUsed = null) {
  const company = await getCompanyById(companyId);

  if (!company) {
    throw new Error("Company not found");
  }

  const parsed = validatedResearchSchema.safeParse(rawValidatedResearch);
  if (!parsed.success) {
    throw new Error(
      `Research REJECTED: ${parsed.error.issues.map((i) => i.message).join("; ")}`
    );
  }
  const validatedResearch = parsed.data;
  const sourceUrlsJson = JSON.stringify(validatedResearch.sources);
  const completedAt = new Date().toISOString();

  // FIX: previously read-then-wrote (SELECT, then INSERT or UPDATE based
  // on what was found) — not atomic, so two concurrent requests for the
  // same company could both see "nothing exists" and both INSERT,
  // violating the one-row-per-company intent. upsertResearch() uses
  // INSERT ... ON CONFLICT (company_id) so the database resolves this
  // atomically instead of the application racing itself.
  const researchRecord = await upsertResearch(
    companyId,
    validatedResearch.summary,
    sourceUrlsJson,
    modelUsed,
    completedAt
  );

  // FIX: was passing validatedResearch.summary directly (a plain string)
  // into a TEXT column. company_memory.memory is now JSONB (see migration
  // 003), and updateCompanyMemory() merges patches instead of overwriting
  // the whole record — so this only touches the research-related keys and
  // leaves any sentiment/outreach history other agents have written alone.
  const memoryPatch = {
    lastResearchSummary: validatedResearch.summary,
    lastResearchAt: completedAt,
    lastResearchSourceUrls: sourceUrlsJson,
  };

  try {
    const existingMemory = await getCompanyMemoryByCompany(companyId);
    if (existingMemory.length > 0) {
      await updateCompanyMemory(existingMemory[0].id, memoryPatch);
    } else {
      await createCompanyMemory(companyId, memoryPatch);
    }
  } catch (memoryErr) {
    // The research row is already committed at this point — surface the
    // desync loudly rather than silently returning memoryUpdated: true.
    throw new Error(
      `company_research row ${researchRecord.id} was written, but company_memory update failed: ${memoryErr.message}`
    );
  }

  return {
    companyId,
    research: researchRecord,
    memoryUpdated: true,
  };
}

// --------------------
// Agent Trigger, Processing & Logging
// Trigger → input → processing → output shell, keyed on leadId (this is
// what POST /api/v1/leads/:id/research, per docs/api-contracts.md, should
// call). Runs prompt assembly, the AI Gateway call, and validation in
// sequence, then saves the result, and logs every attempt to agent_runs —
// including failures — by creating the row up front (status RUNNING) and
// updating it in a finally-style success/failure branch, so a crash
// mid-pipeline still leaves a visible row instead of nothing at all.
//
// Loosely coupled to the model provider: `aiGatewayConfig` is passed straight
// through to callAiGateway() untouched, so swapping providers is an env-var
// change, not a rewrite here.
//
// NOTE: cost_usd is not populated — the AI Gateway response isn't parsed for
// token usage/cost yet. What counts as "good output" for the golden-set eval
// still needs to be agreed on; not encoded anywhere yet.
// --------------------
async function runResearchPipeline(leadId, aiGatewayConfig = {}) {
  const lead = await getLeadById(leadId);
  if (!lead) {
    throw new Error("Lead not found");
  }

  const inputData = {
    leadId,
    companyId: lead.company_id,
    hiringSignalId: lead.hiring_signal_id,
  };
  const inputHash = crypto.createHash("sha256").update(JSON.stringify(inputData)).digest("hex");

  const startedAt = Date.now();
  const run = await createAgentRun(
    leadId,
    AGENT_NAME,
    inputData,
    inputHash,
    null, // model — not known until the gateway responds
    null, // outputData
    null, // outputReference
    "RUNNING",
    null, // latencyMs
    null, // costUsd
    null // completedAt
  );

  try {
    const agentContext = await runResearchAgent(lead.company_id, lead.hiring_signal_id);
    const gatewayResult = await callAiGateway(agentContext.prompt, aiGatewayConfig);

    const allowedUrls = [agentContext.hiringSignal.source_url, agentContext.company.linkedin_url].filter(
      Boolean
    );
    const validated = validateAndExtractSources(gatewayResult.raw, allowedUrls);
    const saved = await saveValidatedResearch(lead.company_id, validated, gatewayResult.model);

    await updateAgentRun(
      run.id,
      { research: saved.research, memoryUpdated: saved.memoryUpdated },
      "SUCCEEDED",
      Date.now() - startedAt,
      null,
      new Date().toISOString()
    );

    return saved;
  } catch (err) {
    await updateAgentRun(
      run.id,
      { error: err.message },
      "FAILED",
      Date.now() - startedAt,
      null,
      new Date().toISOString()
    );
    throw err;
  }
}

module.exports = {
  runResearchAgent,
  assembleResearchPrompt,
  saveValidatedResearch,
  runResearchPipeline,
  isOlderThanDays,
};
