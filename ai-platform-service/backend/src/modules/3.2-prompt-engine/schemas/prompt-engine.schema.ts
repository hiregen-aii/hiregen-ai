import { z } from "zod";

const variableSchema = z.object({
  name: z.string().trim().min(1),
  required: z.boolean(),
  type: z.enum(["string", "number", "boolean", "object"]),
});

export const renderPromptRequestSchema = z.object({
  templateId: z.string().trim().min(1),
  agentName: z.string().trim().min(1),
  version: z.number().int().positive().optional(),
  variables: z.record(z.string(), z.unknown()),
});

export const promptVariableSchema = variableSchema;

export const promptTemplateSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1),
  agentName: z.string().trim().min(1),
  description: z.string().optional(),
  version: z.number().int().positive(),
  systemPrompt: z.string().min(1),
  userPrompt: z.string().min(1),
  variables: z.array(variableSchema),
  active: z.boolean(),
  status: z.enum(["draft", "active", "retired"]).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type RenderPromptRequestInput = z.infer<typeof renderPromptRequestSchema>;
