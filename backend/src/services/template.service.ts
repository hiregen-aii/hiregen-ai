/**
 * Template service — Module 3.4 Personalization
 * SRS §10 rule: business logic lives here; no raw SQL (delegates to repository).
 *
 * Provides:
 *  - template selection for the Personalization Agent (hiring_type + step)
 *  - deterministic variable rendering (AI variables are left for the agent)
 *  - render preview for the Admin Console template builder (Module 5.5, Team 5)
 */
import { TemplateRepository } from "../repositories/template.repository.js";
import {
  extractVariables,
  type HiringType,
  type TemplateRow,
} from "../schemas/template.schema.js";

/** Variables the backend can fill without AI (see design proposal §3). */
export type DeterministicContext = Partial<
  Record<
    | "contact_name"
    | "contact_title"
    | "company_name"
    | "role_title"
    | "hiring_type_label"
    | "sender_name"
    | "sender_title"
    | "calendar_link",
    string
  >
>;

/** Variables only the Personalization Agent may fill (AI + memory, SRS §8/§11). */
export const AI_VARIABLES = new Set([
  "research_insight",
  "prior_context",
  "value_prop",
]);

export const HIRING_TYPE_LABELS: Record<HiringType, string> = {
  INTERN: "internship hiring",
  FULL_TIME: "full-time hiring",
  CONTRACT: "contract hiring",
  BULK_HIRING: "bulk hiring",
  CAMPUS_DRIVE: "campus drive",
};

export class UnresolvedVariableError extends Error {
  constructor(public readonly variables: string[]) {
    super(`Unresolved template variables: ${variables.join(", ")}`);
    this.name = "UnresolvedVariableError";
  }
}

export class TemplateService {
  constructor(private readonly repo: TemplateRepository) {}

  /** Personalization Agent entry point: which template do I fill? */
  async selectTemplate(
    hiringType: HiringType,
    stepNumber = 1
  ): Promise<TemplateRow> {
    const tpl = await this.repo.findActive(hiringType, stepNumber);
    if (!tpl) {
      throw new Error(
        `No active template for ${hiringType} step ${stepNumber} — seed data missing?`
      );
    }
    return tpl;
  }

  /**
   * Fill deterministic variables; leave AI variables ({{research_insight}},
   * {{prior_context}}, {{value_prop}}) untouched for the agent.
   * `strict` = true additionally requires that NO variables remain (used when
   * previewing a fully-rendered draft before it is written to approval_queue).
   */
  render(
    template: string,
    ctx: DeterministicContext,
    opts: { strict?: boolean } = {}
  ): string {
    const out = template.replace(
      /\{\{([a-z][a-z0-9_]*)\}\}/g,
      (whole, name: string) => {
        const val = (ctx as Record<string, string | undefined>)[name];
        if (val !== undefined) return val;
        return whole; // leave for AI pass (or strict check below)
      }
    );
    if (opts.strict) {
      const remaining = extractVariables(out);
      if (remaining.length > 0) throw new UnresolvedVariableError(remaining);
    }
    return out;
  }

  /** Convenience: render subject+body of a template with one context. */
  renderTemplate(
    tpl: TemplateRow,
    ctx: DeterministicContext,
    opts: { strict?: boolean } = {}
  ): { subject: string; body: string } {
    return {
      subject: this.render(tpl.subject_template, ctx, opts),
      body: this.render(tpl.body_template, ctx, opts),
    };
  }
}
