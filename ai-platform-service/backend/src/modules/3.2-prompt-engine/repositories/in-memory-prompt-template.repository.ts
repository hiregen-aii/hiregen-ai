import {
  PromptTemplate,
  PromptTemplateVersion,
} from "../types/prompt-engine.types";
import { PromptTemplateRepository } from "./prompt-template.repository";

export class InMemoryPromptTemplateRepository implements PromptTemplateRepository {
  private readonly versions = new Map<string, Map<number, PromptTemplateVersion>>();

  async getTemplate(templateId: string, version?: number): Promise<PromptTemplate | null> {
    if (version !== undefined) return this.getVersion(templateId, version);
    return this.getActiveVersion(templateId);
  }

  async listTemplates(agentName?: string): Promise<PromptTemplate[]> {
    const output: PromptTemplate[] = [];
    for (const [templateId] of this.versions) {
      const active = await this.getActiveVersion(templateId);
      if (active && (!agentName || active.agentName === agentName)) output.push(active);
    }
    return output;
  }

  async saveTemplate(template: PromptTemplate): Promise<PromptTemplate> {
    const existing = this.versions.get(template.id) ?? new Map<number, PromptTemplateVersion>();
    if (template.active || template.status === "active") {
      for (const item of existing.values()) {
        item.active = false;
        if (item.status === "active") item.status = "retired";
      }
    }
    existing.set(template.version, { ...template, templateId: template.id });
    this.versions.set(template.id, existing);
    return template;
  }

  async createVersion(version: PromptTemplateVersion): Promise<PromptTemplateVersion> {
    const existing = this.versions.get(version.templateId) ?? new Map<number, PromptTemplateVersion>();
    if (existing.has(version.version)) {
      throw new Error(`Prompt template version already exists: ${version.templateId} v${version.version}`);
    }
    existing.set(version.version, { ...version });
    this.versions.set(version.templateId, existing);
    return version;
  }

  async getVersion(templateId: string, version: number): Promise<PromptTemplateVersion | null> {
    return this.versions.get(templateId)?.get(version) ?? null;
  }

  async getActiveVersion(templateId: string): Promise<PromptTemplateVersion | null> {
    const versions = this.versions.get(templateId);
    if (!versions) return null;
    return Array.from(versions.values()).find((item) => item.active && item.status === "active") ?? null;
  }

  async activateVersion(templateId: string, version: number): Promise<void> {
    const versions = this.versions.get(templateId);
    const target = versions?.get(version);
    if (!target) throw new Error(`Prompt template version not found: ${templateId} v${version}`);

    for (const item of versions!.values()) {
      item.active = false;
      if (item.status === "active") item.status = "retired";
    }

    target.active = true;
    target.status = "active";
  }
}
