/**
   * Personalization Agent runtime skeleton.
   *
   * What it does:
   * 1) selects the right template for a lead's hiring_type + sequence step
   * 2) fills deterministic variables in the template
   * 3) calls the AI Gateway for only the AI-owned fields
   * 4) renders the final draft strictly (no unresolved placeholders)
   * 5) writes the draft to approval_queue and logs the run to agent_runs
   *
   * This keeps Module 3.4 directly aligned with SRS §8, §11, §15, §20.
   */
import { createHash } from "node:crypto";
import { TemplateService, HIRING_TYPE_LABELS } from "../services/template.service.js";
import type { TemplateRow } from "../schemas/template.schema.js";
import {
  ApprovalQueueDraft,
  PersonalizationAIOutput,
  PersonalizationJob,
  type PersonalizationJob as PersonalizationJobType,
  type PersonalizationAIOutput as PersonalizationAIOutputType,
} from "../schemas/personalization-agent.schema.js";

  export interface AIJsonClient {
    generateJSON(input: {
      systemPrompt: string;
      userPrompt: string;
      model?: string;
    }): Promise<unknown>;
  }

  export interface ApprovalQueueWriter {
    createDraft(input: {
      lead_id: string;
      draft_subject: string;
      draft_body: string;
      step_number: number;
      status: "PENDING";
    }): Promise<ApprovalQueueDraft>;
  }

  export interface LeadStageWriter {
    markOutreachDrafted(leadId: string): Promise<void>;
  }

  export interface AgentRunWriter {
    logRun(input: {
      agent_name: "PersonalizationAgent";
      lead_id: string;
      input_hash: string;
      model_used: string;
      latency_ms: number;
      output_ref: string;
      meta?: Record<string, unknown>;
    }): Promise<void>;
  }

  export interface PersonalizationAgentDeps {
    templates: TemplateService;
    ai: AIJsonClient;
    approvalQueue: ApprovalQueueWriter;
    leads: LeadStageWriter;
    agentRuns: AgentRunWriter;
    defaultModel?: string;
  }

  export interface PersonalizationDraftResult {
    template: TemplateRow;
    aiFields: PersonalizationAIOutputType;
    approvalDraft: ApprovalQueueDraft;
    subject: string;
    body: string;
  }

  const AI_FIELDS = ["research_insight", "value_prop", "prior_context"] as const;

  export class PersonalizationAgent {
    private readonly defaultModel: string;

    constructor(private readonly deps: PersonalizationAgentDeps) {
      this.defaultModel = deps.defaultModel ?? "claude-sonnet";
    }

    async draft(jobInput: PersonalizationJobType): Promise<PersonalizationDraftResult> {
      const job = PersonalizationJob.parse(jobInput);
      const template = await this.deps.templates.selectTemplate(job.hiring_type, job.step_number);

      const deterministic = {
  contact_name: job.contact_name,
  company_name: job.company_name,
  role_title: job.role_title,
  hiring_type_label: HIRING_TYPE_LABELS[job.hiring_type],
  sender_name: job.sender_name,

  ...(job.contact_title !== undefined && {
    contact_title: job.contact_title,
  }),

  ...(job.sender_title !== undefined && {
    sender_title: job.sender_title,
  }),

  ...(job.calendar_link !== undefined && {
    calendar_link: job.calendar_link,
  }),
};

      const partial = this.deps.templates.renderTemplate(template, deterministic);
      const systemPrompt = buildSystemPrompt();
      const userPrompt = buildUserPrompt({ job, template, partial });
      const inputHash = hash(JSON.stringify({ template_id: template.id, systemPrompt, userPrompt }));

      const started = Date.now();
      const aiRaw = await this.deps.ai.generateJSON({
        systemPrompt,
        userPrompt,
        model: this.defaultModel,
      });
      const latencyMs = Date.now() - started;
      const aiFields = PersonalizationAIOutput.parse(aiRaw);

      const finalContext: Record<string, string> = {
        ...compactStringRecord(deterministic),
        research_insight: aiFields.research_insight,
        value_prop: aiFields.value_prop,
      };
      if (aiFields.prior_context) finalContext.prior_context = aiFields.prior_context;

      const subject = fillTemplate(template.subject_template, finalContext, true);
      const body = fillTemplate(template.body_template, finalContext, true);

      const approvalDraft = ApprovalQueueDraft.parse(
        await this.deps.approvalQueue.createDraft({
          lead_id: job.lead_id,
          draft_subject: subject,
          draft_body: body,
          step_number: job.step_number,
          status: "PENDING",
        })
      );

      await this.deps.leads.markOutreachDrafted(job.lead_id);
      await this.deps.agentRuns.logRun({
        agent_name: "PersonalizationAgent",
        lead_id: job.lead_id,
        input_hash: inputHash,
        model_used: this.defaultModel,
        latency_ms: latencyMs,
        output_ref: `approval_queue:${approvalDraft.id}`,
        meta: {
          template_id: template.id,
          step_number: template.step_number,
          confidence: aiFields.confidence,
          grounding_notes: aiFields.grounding_notes,
        },
      });

      return { template, aiFields, approvalDraft, subject, body };
    }
  }

  export function buildSystemPrompt(): string {
    return [
      "You are the Personalization Agent for HireGen AI.",
      "Write ONLY JSON with keys research_insight, value_prop, prior_context, confidence, grounding_notes.",
      "research_insight must be grounded only in the provided research summary.",
      "Read company memory before writing. Never re-pitch an offering that memory shows was rejected.",
      "Respect tone and contact preferences. Keep each field concise.",
      "If prior_context is not applicable, return null.",
    ].join(" ");
  }

  export function buildUserPrompt(args: {
    job: PersonalizationJobType;
    template: TemplateRow;
    partial: { subject: string; body: string };
  }): string {
    const { job, template, partial } = args;
    const valueProps = Array.isArray(job.campaign_value_props)
      ? job.campaign_value_props.join("; ")
      : job.campaign_value_props;

    return [
      `TEMPLATE (tone: ${template.tone}, hiring_type: ${job.hiring_type}, step: ${job.step_number})`,
      `Subject: ${partial.subject}`,
      "Body:",
      partial.body,
      "",
      "COMPANY RESEARCH:",
      job.research_summary,
      "",
      "COMPANY MEMORY JSON:",
      JSON.stringify(job.company_memory_json ?? {}, null, 2),
      "",
      "CAMPAIGN VALUE PROPOSITIONS:",
      valueProps,
      "",
      "LEAD CONTEXT:",
      `Role: ${job.role_title}`,
      `Urgency: ${job.urgency}`,
      `Fit score: ${job.fit_score}`,
      "",
      "Return only the JSON object.",
    ].join("\n");
  }

  export function fillTemplate(
    template: string,
    values: Record<string, string>,
    strict = false
  ): string {
    const rendered = template.replace(/\{\{([a-z][a-z0-9_]*)\}\}/g, (whole, key: string) => {
      const value = values[key];
      return value !== undefined ? value : whole;
    });

    if (strict) {
      const unresolved = [...rendered.matchAll(/\{\{([a-z][a-z0-9_]*)\}\}/g)].map((m) => m[1]);
      if (unresolved.length > 0) {
        throw new Error(`Unresolved personalization variables: ${unresolved.join(", ")}`);
      }
    }

    return rendered;
  }

  function compactStringRecord(input: Record<string, string | undefined>): Record<string, string> {
    return Object.fromEntries(
      Object.entries(input).filter((entry): entry is [string, string] => typeof entry[1] === "string" && entry[1].length > 0)
    );
  }

  function hash(value: string): string {
    return createHash("sha256").update(value).digest("hex");
  }
