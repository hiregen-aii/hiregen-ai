import { PromptTemplate } from "../../types/prompt-engine.types";

export const firstTouchTemplate: PromptTemplate = {
  id: "personalization_first_touch",
  name: "Personalization First Touch",
  agentName: "personalization",
  description: "Development fixture for first-touch personalization.",
  version: 1,
  systemPrompt: "You are a professional recruitment outreach assistant.",
  userPrompt:
    "Create a concise personalized message for {{contact_name}} at {{company_name}}. Context: {{research_summary}}.",
  variables: [
    { name: "contact_name", required: true, type: "string" },
    { name: "company_name", required: true, type: "string" },
    { name: "research_summary", required: false, type: "string" },
  ],
  active: true,
  status: "active",
};
