import type { Job } from "bullmq";
import type { EnrichmentJobPayload, EnrichmentJobResult } from "../types";

/**
 * MOCKED PROCESSOR - per plan agreed with Shreyaj: proceed with a mocked
 * payload structure for now, integrate the real one once it's ready.
 *
 * Team 2's Enrichment Agent (Gauri, Module 2.2) hasn't confirmed a real
 * input/output contract yet, and there's an open question on whether
 * that agent is Python (per the SRS) or Node.js (per the team's own
 * task sheet) - confirm with Gauri before wiring this to the real thing.
 *
 * Do not rename this function or change its signature when swapping in
 * the real call - producers.ts and workers.ts both depend on it staying
 * the same shape.
 */
export async function processEnrichmentJob(
  job: Job<EnrichmentJobPayload>
): Promise<EnrichmentJobResult> {
  const { companyId, companyName } = job.data;

  // ---- MOCK START - remove once Team 2's real enrichment call is confirmed ----
  const mockResult: EnrichmentJobResult = {
    companyId,
    industry: "Unknown (mocked)",
    sizeRange: "51-200 (mocked)",
    linkedinUrl: `https://linkedin.com/company/${companyName.toLowerCase().replace(/\s+/g, "-")}`,
    enrichedAt: new Date().toISOString(),
  };
  // ---- MOCK END ----

  console.log(`[enrichment] (MOCKED) processed ${companyName} (${companyId})`);
  return mockResult;
}
