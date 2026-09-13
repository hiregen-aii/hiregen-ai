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

async function callAiGateway(prompt, config = {}) {
  let baseUrl = config.baseUrl || process.env.AI_GATEWAY_BASE_URL;
  let apiKey = config.apiKey || process.env.AI_GATEWAY_API_KEY || process.env.GROQ_API_KEY || process.env.GROK_API_KEY || process.env.XAI_API_KEY;
  let model = config.model || process.env.AI_GATEWAY_MODEL;

  // Auto-detect Groq or xAI Grok provider if API key is provided
  if (!baseUrl && (process.env.GROQ_API_KEY || (apiKey && apiKey.startsWith("gsk_")))) {
    baseUrl = "https://api.groq.com/openai/v1";
    model = model || process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
    apiKey = apiKey || process.env.GROQ_API_KEY;
  } else if (!baseUrl && (process.env.GROK_API_KEY || process.env.XAI_API_KEY || (apiKey && apiKey.startsWith("xai-")))) {
    baseUrl = "https://api.x.ai/v1";
    model = model || "grok-2-latest";
    apiKey = apiKey || process.env.GROK_API_KEY || process.env.XAI_API_KEY;
  }

  if (!baseUrl || !apiKey || !model) {
    throw new Error(
      "AI Gateway is not configured — set GROQ_API_KEY or GROK_API_KEY in .env, or AI_GATEWAY_BASE_URL, AI_GATEWAY_API_KEY, and AI_GATEWAY_MODEL"
    );
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(`AI Gateway request failed (${response.status}): ${errorBody.slice(0, 300)}`);
  }

  const payload = await response.json();
  const rawContent = payload?.choices?.[0]?.message?.content;
  if (!rawContent) {
    throw new Error("AI Gateway returned no message content");
  }

  let rawResult;
  try {
    rawResult = JSON.parse(rawContent);
  } catch (err) {
    throw new Error(`AI Gateway returned non-JSON content: ${err.message}`);
  }

  // Don't silently work around a shape mismatch — surface it immediately
  // so it gets reported back rather than fed to the source validator as-is.
  if (typeof rawResult !== "object" || rawResult === null || Array.isArray(rawResult)) {
    throw new Error("AI Gateway response does not match the agreed schema (expected a JSON object)");
  }

  return {
    raw: rawResult,
    model,
  };
}

module.exports = {
  callAiGateway,
  SYSTEM_PROMPT,
};
