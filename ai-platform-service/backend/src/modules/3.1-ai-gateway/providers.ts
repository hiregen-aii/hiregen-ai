import { AIProvider, AIRequest, AIResponse, ProviderName } from "./types";

async function parseJsonResponse(response: Response, provider: ProviderName): Promise<any> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${provider}: HTTP ${response.status} ${text}`);
  }
  return response.json();
}

class GeminiProvider implements AIProvider {
  async generate(request: AIRequest): Promise<AIResponse> {
    const start = Date.now();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: request.prompt }] }] }),
    });
    const data = await parseJsonResponse(response, "gemini");
    const usage = data.usageMetadata;
    return {
      provider: "gemini",
      model,
      content: data.candidates?.[0]?.content?.parts?.map((p: any) => p.text ?? "").join("") ?? "",
      tokenUsage: usage ? {
        inputTokens: usage.promptTokenCount ?? 0,
        outputTokens: usage.candidatesTokenCount ?? 0,
        totalTokens: usage.totalTokenCount ?? 0,
      } : undefined,
      responseTimeMs: Date.now() - start,
    };
  }
}

class GroqProvider implements AIProvider {
  async generate(request: AIRequest): Promise<AIResponse> {
    const start = Date.now();
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY is not configured.");
    const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ model, messages: [{ role: "user", content: request.prompt }] }),
    });
    const data = await parseJsonResponse(response, "groq");
    const usage = data.usage;
    return {
      provider: "groq",
      model: data.model ?? model,
      content: data.choices?.[0]?.message?.content ?? "",
      tokenUsage: usage ? {
        inputTokens: usage.prompt_tokens ?? 0,
        outputTokens: usage.completion_tokens ?? 0,
        totalTokens: usage.total_tokens ?? 0,
      } : undefined,
      responseTimeMs: Date.now() - start,
    };
  }
}

export const providers: Record<ProviderName, AIProvider> = Object.freeze({
  gemini: new GeminiProvider(),
  groq: new GroqProvider(),
});
