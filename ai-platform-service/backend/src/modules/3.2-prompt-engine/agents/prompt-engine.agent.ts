import { PromptEngineService } from "../services/prompt-engine.service";
import { RenderPromptRequest, RenderPromptResponse } from "../types/prompt-engine.types";

export class PromptEngineAgent {
  constructor(private readonly promptEngineService: PromptEngineService) {}

  async render(request: RenderPromptRequest): Promise<RenderPromptResponse> {
    return this.promptEngineService.renderPrompt(request);
  }
}
