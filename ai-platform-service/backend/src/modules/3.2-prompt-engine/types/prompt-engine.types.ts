export type PromptVariableType = "string" | "number" | "boolean" | "object";

export interface PromptVariable {
  name: string;
  required: boolean;
  type: PromptVariableType;
}

export type PromptTemplateStatus = "draft" | "active" | "retired";

export interface PromptTemplate {
  id: string;
  name: string;
  agentName: string;
  description?: string;
  version: number;
  systemPrompt: string;
  userPrompt: string;
  variables: PromptVariable[];
  active: boolean;
  status?: PromptTemplateStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface RenderPromptRequest {
  templateId: string;
  agentName: string;
  version?: number;
  variables: Record<string, unknown>;
}

export interface RenderPromptMetadata {
  templateId: string;
  promptVersion: number;
  agentName: string;
}

export interface RenderPromptResponse {
  systemPrompt: string;
  userPrompt: string;
  renderedPrompt: string;
  metadata: RenderPromptMetadata;
}

export interface PromptTemplateVersion extends PromptTemplate {
  templateId: string;
}
