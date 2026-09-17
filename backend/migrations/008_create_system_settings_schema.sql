-- Migration 008: System & AI Model Dynamic Settings Schema
-- Allows runtime configuration of AI Providers (Groq, Gemini, OpenAI, Grok, Custom)
-- without hardcoding API keys or models in code.

CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default AI settings if not present
INSERT INTO system_settings (key, value, updated_at)
VALUES (
    'ai_config',
    '{
        "provider": "GROQ",
        "model": "groq/compound-mini",
        "custom_base_url": "",
        "temperature": 0.35,
        "is_active": true
    }'::jsonb,
    NOW()
)
ON CONFLICT (key) DO NOTHING;
