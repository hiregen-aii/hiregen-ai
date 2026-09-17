// AI Gateway call + summarization
// Provider-agnostic: any OpenAI-compatible chat-completions endpoint works
// (Groq, OpenAI, a self-hosted gateway, etc.) — swap via env vars only,
// no provider-specific code here.

const SYSTEM_PROMPT = `You are a research assistant for a B2B recruitment platform. Given a company
and an open role they are hiring for, produce a short factual research brief.

Rules:
- State facts supported ONLY by real source URLs given in the prompt context.
- NEVER invent or hallucinate URLs. Use ONLY exact URLs present in the prompt.
- IF there isn't enough information to summarize the company, set "status" to
  "INSUFFICIENT_DATA", explain why in "summary", and return an empty "sources" array.
- Return ONLY valid JSON matching this schema:
  {"status": "SUCCESS" | "INSUFFICIENT_DATA", "summary": string, "sources": [{"url": string, "supports": string}]}`;

const { getActiveAiConfig } = require('./aiSettings.service');

async function callAiGateway(prompt, config = {}) {
  const activeSystemPrompt = config.systemPrompt || SYSTEM_PROMPT;
  const runtimeConfig = await getActiveAiConfig();

  const provider = (config.provider || runtimeConfig.provider || "GROQ").toUpperCase();
  const apiKey = config.apiKey || runtimeConfig.apiKey;
  const model = config.model || runtimeConfig.model;
  const baseUrl = config.baseUrl || runtimeConfig.baseUrl;
  const temperature = config.temperature ?? runtimeConfig.temperature ?? 0.35;

  // 1. Google Gemini Provider
  if (provider === "GEMINI" && apiKey) {
    try {
      const endpoint = `${baseUrl.replace(/\/+$/, '')}/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: `${activeSystemPrompt}\n\nTask:\n${prompt}` }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawContent) {
          let parsed;
          try {
            parsed = JSON.parse(rawContent);
          } catch {
            const match = rawContent.match(/\{[\s\S]*\}/);
            if (match) parsed = JSON.parse(match[0]);
          }
          if (parsed) {
            return { raw: parsed, model, provider: "Google Gemini" };
          }
        }
      } else {
        const errText = await response.text().catch(() => "");
        console.warn(`[AI GATEWAY] Gemini returned HTTP ${response.status}: ${errText.slice(0, 200)}. Trying fallback.`);
      }
    } catch (geminiErr) {
      console.warn(`[AI GATEWAY] Gemini call error (${geminiErr.message}). Trying fallback.`);
    }
  }

  // 2. OpenAI-compatible Providers (Groq, OpenAI, xAI Grok, Custom)
  if (apiKey || provider === "CUSTOM") {
    try {
      const endpoint = `${baseUrl.replace(/\/+$/, '')}/chat/completions`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey || "test"}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: activeSystemPrompt },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
          temperature,
        }),
      });

      if (response.ok) {
        const payload = await response.json();
        const rawContent = payload?.choices?.[0]?.message?.content;
        if (rawContent) {
          let rawResult = JSON.parse(rawContent);
          return {
            raw: rawResult,
            model,
            provider,
          };
        }
      } else {
        const errText = await response.text().catch(() => "");
        console.warn(`[AI GATEWAY] ${provider} returned HTTP ${response.status}: ${errText.slice(0, 200)}. Trying fallback.`);
      }
    } catch (provErr) {
      console.warn(`[AI GATEWAY] ${provider} call error (${provErr.message}). Trying fallback.`);
    }
  }

  // 3. Fallback: If primary selected provider failed, attempt Groq then Gemini from .env
  if (provider !== "GROQ" && process.env.GROQ_API_KEY) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "groq/compound-mini",
          messages: [
            { role: "system", content: activeSystemPrompt },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.35,
        }),
      });

      if (response.ok) {
        const payload = await response.json();
        const rawContent = payload?.choices?.[0]?.message?.content;
        if (rawContent) {
          return {
            raw: JSON.parse(rawContent),
            model: "groq/compound-mini",
            provider: "Groq (Fallback)",
          };
        }
      }
    } catch {
      // ignore
    }
  }

  throw new Error(`AI Gateway failed across active provider (${provider}) and fallbacks. Check API keys and settings.`);
}

module.exports = {
  callAiGateway,
  SYSTEM_PROMPT,
};
