import type { Job } from "bullmq";
import type { ResearchJobPayload, ResearchJobResult } from "../types";

/**
 * MOCKED PROCESSOR - no real contract has been confirmed yet by Team 2's
 * Research Engine (Arpita Pancholi, Module 2.4). Same treatment as
 * enrichment.processor.ts: build against a reasonable guessed shape now,
 * swap in the real call once Arpita's interface is confirmed, without
 * changing this function's name or signature.
 */
export async function processResearchJob(job: Job<ResearchJobPayload>): Promise<ResearchJobResult> {
  const { companyId, companyName } = job.data;

  // ---- MOCK START - remove once Team 2's real Research Agent call is confirmed ----
  const mockResult: ResearchJobResult = {
    companyId,
    summary: `(MOCKED) ${companyName} is a company with an active hiring signal. Real summary pending Research Agent integration.`,
    sourceUrls: [],
    completedAt: new Date().toISOString(),
  };
  // ---- MOCK END ----

  console.log(`[research] (MOCKED) processed ${companyName} (${companyId})`);
  return mockResult;
}
