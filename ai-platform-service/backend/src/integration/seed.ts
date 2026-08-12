import type { PromptTemplate } from "../modules/3.2-prompt-engine/types/prompt-engine.types";
import { TemplateRow } from "../modules/3.4-personalization/schemas/template.schema";

export const IDS = {
  company: "11111111-1111-4111-8111-111111111111",
  lead: "22222222-2222-4222-8222-222222222222",
  campaign: "33333333-3333-4333-8333-333333333333",
  template: "44444444-4444-4444-8444-444444444444",
};

export const promptTemplate: PromptTemplate = {
  id: "personalization_first_touch",
  name: "Personalization First Touch",
  agentName: "personalization",
  version: 1,
  systemPrompt: "Create a grounded outreach email for {{company_name}}.",
  userPrompt: "Contact {{contact_name}} about {{role_title}}. Research: {{research_summary}}.",
  variables: [
    { name: "company_name", required: true, type: "string" },
    { name: "contact_name", required: true, type: "string" },
    { name: "role_title", required: true, type: "string" },
    { name: "research_summary", required: true, type: "string" },
  ],
  active: true,
  status: "active",
};

export const personalizationTemplate: TemplateRow = {
  id: IDS.template,
  name: "Full Time First Touch",
  hiring_type: "FULL_TIME",
  step_number: 1,
  subject_template: "A note for {{contact_name}} at {{company_name}}",
  body_template: "Hi {{contact_name}},\n\nI noticed {{company_name}} is hiring for {{role_title}}. {{research_insight}}\n\n{{value_prop}}\n\nBest, {{sender_name}}",
  variables: [
    { name: "contact_name", description: "Contact name", source: "deterministic" },
    { name: "company_name", description: "Company name", source: "deterministic" },
    { name: "role_title", description: "Role title", source: "deterministic" },
    { name: "research_insight", description: "Grounded research insight", source: "ai" },
    { name: "value_prop", description: "Campaign value proposition", source: "ai" },
    { name: "sender_name", description: "Sender name", source: "deterministic" },
  ],
  tone: "professional",
  active: true,
  created_by: null,
  created_at: new Date(),
  updated_at: new Date(),
};
