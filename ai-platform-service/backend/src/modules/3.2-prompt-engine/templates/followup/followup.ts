import { PromptTemplate } from "../../types/prompt-engine.types";

export const followupTemplate: PromptTemplate = {
  id: "followup_email",
  name: "Follow-up Email",
  agentName: "followup",
  description: "Development fixture for follow-up generation.",
  version: 1,
  systemPrompt: "You are a professional recruitment follow-up assistant.",
  userPrompt:
    "Draft a concise follow-up for {{contact_name}} at {{company_name}} using this previous outreach: {{previous_message}}.",
  variables: [
    { name: "contact_name", required: true, type: "string" },
    { name: "company_name", required: true, type: "string" },
    { name: "previous_message", required: true, type: "string" },
  ],
  active: true,
  status: "active",
};
