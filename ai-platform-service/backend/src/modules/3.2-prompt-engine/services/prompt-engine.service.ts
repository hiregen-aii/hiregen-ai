import { renderPromptRequestSchema } from "../schemas/prompt-engine.schema";
import { PromptTemplateRepository } from "../repositories/prompt-template.repository";
import {
  PromptTemplate,
  PromptTemplateVersion,
  RenderPromptRequest,
  RenderPromptResponse,
} from "../types/prompt-engine.types";

const PLACEHOLDER_PATTERN = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g;

export class PromptEngineService {
  constructor(private readonly templateRepository: PromptTemplateRepository) {}

  async renderPrompt(request: RenderPromptRequest): Promise<RenderPromptResponse> {
    const validatedRequest = renderPromptRequestSchema.parse(request);
    const template = await this.templateRepository.getTemplate(
      validatedRequest.templateId,
      validatedRequest.version,
    );

    if (!template) {
      throw new Error(`Prompt template not found: ${validatedRequest.templateId}`);
    }

    if (template.agentName !== validatedRequest.agentName) {
      throw new Error(
        `Template ${template.id} is not assigned to agent ${validatedRequest.agentName}`,
      );
    }

    if (!template.active || template.status === "retired" || template.status === "draft") {
      throw new Error(`Prompt template is inactive: ${template.id}`);
    }

    this.validateVariables(template, validatedRequest.variables);

    const systemPrompt = this.renderTemplate(template.systemPrompt, validatedRequest.variables);
    const userPrompt = this.renderTemplate(template.userPrompt, validatedRequest.variables);
    const renderedPrompt = `${systemPrompt}\n\n${userPrompt}`;

    return {
      systemPrompt,
      userPrompt,
      renderedPrompt,
      metadata: {
        templateId: template.id,
        promptVersion: template.version,
        agentName: template.agentName,
      },
    };
  }

  async createVersion(version: PromptTemplateVersion): Promise<PromptTemplateVersion> {
    this.validateTemplateVersion(version);
    return this.templateRepository.createVersion(version);
  }

  async activateVersion(templateId: string, version: number): Promise<void> {
    const target = await this.templateRepository.getVersion(templateId, version);
    if (!target) throw new Error(`Prompt template version not found: ${templateId} v${version}`);
    this.validateTemplateVersion(target);
    await this.templateRepository.activateVersion(templateId, version);
  }

  async getTemplate(templateId: string, version?: number): Promise<PromptTemplate | null> {
    return this.templateRepository.getTemplate(templateId, version);
  }

  private validateVariables(template: PromptTemplate, variables: Record<string, unknown>): void {
    const declared = new Set(template.variables.map((variable) => variable.name));

    for (const variable of template.variables) {
      const value = variables[variable.name];
      if (variable.required && (value === undefined || value === null || value === "")) {
        throw new Error(`Required prompt variable missing: ${variable.name}`);
      }
      if (value !== undefined && value !== null) {
        const actual = Array.isArray(value) ? "object" : typeof value;
        if (actual !== variable.type) {
          throw new Error(`Prompt variable type mismatch: ${variable.name} expected ${variable.type}, received ${actual}`);
        }
      }
    }

    for (const source of [template.systemPrompt, template.userPrompt]) {
      for (const match of source.matchAll(PLACEHOLDER_PATTERN)) {
        if (!declared.has(match[1])) {
          throw new Error(`Prompt references undeclared variable: ${match[1]}`);
        }
      }
    }
  }

  private renderTemplate(template: string, variables: Record<string, unknown>): string {
    const rendered = template.replace(PLACEHOLDER_PATTERN, (_match, variableName: string) => {
      const value = variables[variableName];
      if (value === undefined || value === null) {
        throw new Error(`Prompt variable not provided: ${variableName}`);
      }
      return typeof value === "object" ? JSON.stringify(value) : String(value);
    });

    if (PLACEHOLDER_PATTERN.test(rendered)) {
      PLACEHOLDER_PATTERN.lastIndex = 0;
      throw new Error("Rendered prompt contains unresolved variables");
    }
    PLACEHOLDER_PATTERN.lastIndex = 0;
    return rendered;
  }

  private validateTemplateVersion(template: PromptTemplateVersion): void {
    if (!template.id || !template.templateId || !template.agentName) {
      throw new Error("Prompt template identity fields are required");
    }
    if (!template.systemPrompt.trim() || !template.userPrompt.trim()) {
      throw new Error("Prompt template prompts cannot be empty");
    }

    const names = new Set<string>();
    for (const variable of template.variables) {
      if (names.has(variable.name)) throw new Error(`Duplicate prompt variable: ${variable.name}`);
      names.add(variable.name);
    }

    const placeholders = new Set<string>();
    for (const source of [template.systemPrompt, template.userPrompt]) {
      for (const match of source.matchAll(PLACEHOLDER_PATTERN)) placeholders.add(match[1]);
    }
    for (const placeholder of placeholders) {
      if (!names.has(placeholder)) {
        throw new Error(`Prompt references undeclared variable: ${placeholder}`);
      }
    }
  }
}
