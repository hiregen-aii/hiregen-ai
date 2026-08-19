/**
 * Zod schemas for the Template Library — Module 3.4 Personalization
 * SRS §10: every repository method takes typed, Zod-validated input.
 * SRS §6: templates are config/data — validation here is the safety gate
 *         that keeps malformed templates away from the Personalization Agent.
 */
import { z } from "zod";

/** Mirrors the Postgres hiring_type enum (SRS §9). */
export const HiringType = z.enum([
  "INTERN",
  "FULL_TIME",
  "CONTRACT",
  "BULK_HIRING",
  "CAMPUS_DRIVE",
]);
export type HiringType = z.infer<typeof HiringType>;

/** {{variable}} syntax: double braces, snake_case, no spaces. */
export const VARIABLE_PATTERN = /\{\{([a-z][a-z0-9_]*)\}\}/g;

/** The standard v1 variable vocabulary (see docs/DESIGN_PROPOSAL_template_library.md §3). */
export const KNOWN_VARIABLES = [
  "contact_name",
  "contact_title",
  "company_name",
  "role_title",
  "hiring_type_label",
  "research_insight",
  "prior_context",
  "value_prop",
  "sender_name",
  "sender_title",
  "calendar_link",
] as const;

export const TemplateVariable = z.object({
  name: z.enum(KNOWN_VARIABLES),
  description: z.string().min(1),
  source: z.enum(["deterministic", "ai"]),
});
export type TemplateVariable = z.infer<typeof TemplateVariable>;

/** Extract all {{variables}} used in a template string. */
export function extractVariables(text: string): string[] {
  const found = new Set<string>();

  for (const match of text.matchAll(VARIABLE_PATTERN)) {
    const variable = match[1];
    if (variable) {
      found.add(variable);
    }
  }

  return [...found];
}

export const TemplateCreate = z
  .object({
    name: z.string().min(3).max(255),
    hiring_type: HiringType,
    step_number: z.number().int().min(1).default(1),
    subject_template: z.string().min(3),
    body_template: z.string().min(20),
    variables: z.array(TemplateVariable),
    tone: z.string().min(1).max(50).default("professional"),
    active: z.boolean().default(true),
    created_by: z.string().uuid().optional(),
  })
  .superRefine((tpl, ctx) => {
    // Rule 1: every {{var}} used in subject/body must be declared in `variables`
    const declared = new Set(tpl.variables.map((v) => v.name));
    const used = new Set([
      ...extractVariables(tpl.subject_template),
      ...extractVariables(tpl.body_template),
    ]);
    for (const v of used) {
      if (!(KNOWN_VARIABLES as readonly string[]).includes(v)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Unknown variable {{${v}}} — not in the v1 vocabulary`,
        });
      } else if (!declared.has(v as (typeof KNOWN_VARIABLES)[number])) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Variable {{${v}}} used but not declared in \`variables\``,
        });
      }
    }
    // Rule 2: declared variables must actually be used (keeps metadata honest
    // for the Admin Console template builder, Module 5.5)
    for (const v of declared) {
      if (!used.has(v)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Variable {{${v}}} declared but never used in subject/body`,
        });
      }
    }
  });
export type TemplateCreate = z.infer<typeof TemplateCreate>;

export const TemplateRow = z.object({
  id: z.string().uuid(),
  name: z.string(),
  hiring_type: HiringType,
  step_number: z.number().int(),
  subject_template: z.string(),
  body_template: z.string(),
  variables: z.array(TemplateVariable),
  tone: z.string(),
  active: z.boolean(),
  created_by: z.string().uuid().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});
export type TemplateRow = z.infer<typeof TemplateRow>;
