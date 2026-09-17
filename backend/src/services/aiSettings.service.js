const pool = require("../config/db");

let cachedConfig = null;
let cacheExpiry = 0;

const PROVIDER_METADATA = [
  {
    id: "GROQ",
    name: "Groq Cloud (Ultra-Fast Inference)",
    defaultModel: "groq/compound-mini",
    models: [
      "groq/compound-mini",
      "openai/gpt-oss-120b",
      "openai/gpt-oss-20b",
      "qwen/qwen3.8-27b",
      "groq/compound",
      "llama-3.3-70b-versatile",
    ],
    defaultBaseUrl: "https://api.groq.com/openai/v1",
    envKeyName: "GROQ_API_KEY",
  },
  {
    id: "GEMINI",
    name: "Google Gemini",
    defaultModel: "gemini-2.5-flash",
    models: [
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite",
      "gemini-1.5-pro",
      "gemini-flash-latest",
      "gemini-3.6-flash",
    ],
    defaultBaseUrl: "https://generativelanguage.googleapis.com/v1beta",
    envKeyName: "GEMINI_API_KEY",
  },
  {
    id: "OPENAI",
    name: "OpenAI (ChatGPT)",
    defaultModel: "gpt-4o-mini",
    models: [
      "gpt-4o-mini",
      "gpt-4o",
      "gpt-4-turbo",
      "o1-mini",
      "gpt-3.5-turbo",
    ],
    defaultBaseUrl: "https://api.openai.com/v1",
    envKeyName: "OPENAI_API_KEY",
  },
  {
    id: "GROK",
    name: "xAI Grok",
    defaultModel: "grok-2-latest",
    models: [
      "grok-2-latest",
      "grok-beta",
      "grok-2-vision-1212",
    ],
    defaultBaseUrl: "https://api.x.ai/v1",
    envKeyName: "GROK_API_KEY",
  },
  {
    id: "CUSTOM",
    name: "Custom OpenAI-Compatible (Ollama / LocalAI / Proxy)",
    defaultModel: "mistral",
    models: [
      "mistral",
      "llama3",
      "deepseek-coder",
      "custom",
    ],
    defaultBaseUrl: "http://localhost:11434/v1",
    envKeyName: "AI_GATEWAY_API_KEY",
  },
];

/**
 * Retrieves the currently active AI configuration from DB or .env fallback.
 */
async function getActiveAiConfig() {
  const now = Date.now();
  if (cachedConfig && now < cacheExpiry) {
    return cachedConfig;
  }

  try {
    const res = await pool.query(
      "SELECT value FROM system_settings WHERE key = 'ai_config' LIMIT 1"
    );

    let rawVal = {};
    if (res.rows.length > 0 && res.rows[0].value) {
      rawVal = res.rows[0].value;
    }

    const providerId = (rawVal.provider || (process.env.GROQ_API_KEY ? "GROQ" : (process.env.GEMINI_API_KEY ? "GEMINI" : "GROQ"))).toUpperCase();
    const meta = PROVIDER_METADATA.find((p) => p.id === providerId) || PROVIDER_METADATA[0];

    const model = rawVal.model || process.env.GROQ_MODEL || meta.defaultModel;
    const customBaseUrl = rawVal.custom_base_url || "";
    const temperature = typeof rawVal.temperature === "number" ? rawVal.temperature : 0.35;

    // Resolve API key: DB stored key takes precedence, then environment variable
    let apiKey = rawVal.api_key;
    if (!apiKey) {
      if (providerId === "GROQ") apiKey = process.env.GROQ_API_KEY;
      else if (providerId === "GEMINI") apiKey = process.env.GEMINI_API_KEY;
      else if (providerId === "OPENAI") apiKey = process.env.OPENAI_API_KEY;
      else if (providerId === "GROK") apiKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY;
      else apiKey = process.env.AI_GATEWAY_API_KEY || process.env.GROQ_API_KEY;
    }

    let baseUrl = customBaseUrl || meta.defaultBaseUrl;

    cachedConfig = {
      provider: providerId,
      model,
      apiKey,
      baseUrl,
      temperature,
      hasKey: Boolean(apiKey),
      isCustom: providerId === "CUSTOM",
    };

    cacheExpiry = now + 10000; // 10-second in-memory cache
    return cachedConfig;
  } catch (err) {
    console.warn("[AI SETTINGS] Failed reading system_settings from DB, using env fallback:", err.message);
    const defaultMeta = PROVIDER_METADATA[0];
    return {
      provider: "GROQ",
      model: process.env.GROQ_MODEL || defaultMeta.defaultModel,
      apiKey: process.env.GROQ_API_KEY,
      baseUrl: defaultMeta.defaultBaseUrl,
      temperature: 0.35,
      hasKey: Boolean(process.env.GROQ_API_KEY),
      isCustom: false,
    };
  }
}

/**
 * Returns safe AI settings for frontend consumption (with masked API keys).
 */
async function getPublicAiSettings() {
  const active = await getActiveAiConfig();

  let maskedKey = "";
  if (active.apiKey && active.apiKey.length > 8) {
    maskedKey = `${active.apiKey.slice(0, 4)}...${active.apiKey.slice(-4)}`;
  } else if (active.apiKey) {
    maskedKey = "****";
  }

  return {
    provider: active.provider,
    model: active.model,
    customBaseUrl: active.isCustom ? active.baseUrl : "",
    temperature: active.temperature,
    hasKey: active.hasKey,
    maskedKey,
    availableProviders: PROVIDER_METADATA.map((p) => ({
      id: p.id,
      name: p.name,
      defaultModel: p.defaultModel,
      models: p.models,
      defaultBaseUrl: p.defaultBaseUrl,
    })),
  };
}

/**
 * Updates AI configuration in PostgreSQL and invalidates cache.
 */
async function updateAiSettings({ provider, model, apiKey, customBaseUrl, temperature }) {
  const cleanProvider = (provider || "GROQ").toUpperCase().trim();
  const meta = PROVIDER_METADATA.find((p) => p.id === cleanProvider) || PROVIDER_METADATA[0];

  // Retrieve existing to retain API key if omitted in request
  const existing = await getActiveAiConfig();
  let keyToSave = existing.apiKey;
  if (typeof apiKey === "string" && apiKey.trim()) {
    keyToSave = apiKey.trim();
  }

  const cleanModel = model && model.trim() ? model.trim() : meta.defaultModel;
  const cleanTemp = typeof temperature === "number" ? Math.max(0, Math.min(1, temperature)) : 0.35;
  const cleanBaseUrl = cleanProvider === "CUSTOM" && customBaseUrl ? customBaseUrl.trim() : "";

  const payload = {
    provider: cleanProvider,
    model: cleanModel,
    api_key: keyToSave,
    custom_base_url: cleanBaseUrl,
    temperature: cleanTemp,
    is_active: true,
  };

  await pool.query(
    `INSERT INTO system_settings (key, value, updated_at)
     VALUES ('ai_config', $1, NOW())
     ON CONFLICT (key) DO UPDATE
     SET value = EXCLUDED.value, updated_at = NOW()`,
    [JSON.stringify(payload)]
  );

  // Invalidate cache immediately
  cachedConfig = null;
  cacheExpiry = 0;

  return getPublicAiSettings();
}

/**
 * Tests live connection for a given AI provider configuration.
 */
async function testAiConnection({ provider, model, apiKey, customBaseUrl }) {
  const cleanProvider = (provider || "GROQ").toUpperCase();
  const currentConfig = await getActiveAiConfig();

  const activeKey = (apiKey && apiKey.trim()) ? apiKey.trim() : currentConfig.apiKey;
  const meta = PROVIDER_METADATA.find((p) => p.id === cleanProvider) || PROVIDER_METADATA[0];
  const activeModel = (model && model.trim()) ? model.trim() : meta.defaultModel;
  const activeBaseUrl = cleanProvider === "CUSTOM" && customBaseUrl ? customBaseUrl.trim() : meta.defaultBaseUrl;

  if (!activeKey && cleanProvider !== "CUSTOM") {
    throw new Error(`API key is required to test ${meta.name}`);
  }

  const startTime = Date.now();

  if (cleanProvider === "GEMINI") {
    const endpoint = `${activeBaseUrl}/models/${activeModel}:generateContent?key=${activeKey}`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Hello, reply with only: {\"status\": \"ok\"}" }] }],
        generationConfig: { maxOutputTokens: 20, responseMimeType: "application/json" },
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(`Gemini test failed (${response.status}): ${errText.slice(0, 150)}`);
    }
  } else {
    // OpenAI-compatible format (Groq, OpenAI, Grok, Custom)
    const endpoint = `${activeBaseUrl.replace(/\/+$/, "")}/chat/completions`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${activeKey || "test"}`,
      },
      body: JSON.stringify({
        model: activeModel,
        messages: [{ role: "user", content: "Reply with JSON: {\"status\": \"ok\"}" }],
        max_tokens: 20,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(`${cleanProvider} test failed (${response.status}): ${errText.slice(0, 150)}`);
    }
  }

  const latencyMs = Date.now() - startTime;
  return {
    success: true,
    provider: cleanProvider,
    model: activeModel,
    latencyMs,
    message: `Connected successfully to ${cleanProvider} (${activeModel}) in ${latencyMs}ms.`,
  };
}

module.exports = {
  getActiveAiConfig,
  getPublicAiSettings,
  updateAiSettings,
  testAiConnection,
  PROVIDER_METADATA,
};
