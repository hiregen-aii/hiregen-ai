import {
  PromptTemplate,
  PromptTemplateVersion,
} from "../types/prompt-engine.types";

export interface PromptTemplateRepository {
  getTemplate(templateId: string, version?: number): Promise<PromptTemplate | null>;
  listTemplates(agentName?: string): Promise<PromptTemplate[]>;
  saveTemplate(template: PromptTemplate): Promise<PromptTemplate>;
  createVersion(version: PromptTemplateVersion): Promise<PromptTemplateVersion>;
  getVersion(templateId: string, version: number): Promise<PromptTemplateVersion | null>;
  getActiveVersion(templateId: string): Promise<PromptTemplateVersion | null>;
  activateVersion(templateId: string, version: number): Promise<void>;
}
