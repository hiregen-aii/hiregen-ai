// backend/src/config/routing.ts

import { AgentType, ProviderName } from "./types";

/**
 * Primary provider assigned to each AI agent.
 */
export const AGENT_PROVIDER_MAP: Record<AgentType, ProviderName> = {
    analytics: "gemini",
    classification: "groq",
    discovery: "groq",
    enrichment: "gemini",
    followup: "groq",
    personalization: "gemini",
    research: "groq",
};

/**
 * Default fallback order if the primary provider fails.
 */
export const FALLBACK_PROVIDERS: ProviderName[] = [
    "gemini",
    "groq",
];

/**
 * Returns the ordered list of providers to try for a given agent.
 * The primary provider is always tried first, followed by the
 * remaining providers in the fallback order without duplicates.
 */
export function getProviderOrder(agent: AgentType): ProviderName[] {
    const primaryProvider = AGENT_PROVIDER_MAP[agent];

    return [
        primaryProvider,
        ...FALLBACK_PROVIDERS.filter(
            (provider) => provider !== primaryProvider
        ),
    ];
}