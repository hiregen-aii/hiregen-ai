import type { Job } from "bullmq";
import type { PersonalizationJobPayload, PersonalizationJobResult } from "../types";

/**
 * MOCKED PROCESSOR - no real contract confirmed yet by Team 3's
 * Personalization Agent (Ansh Choudhary / Vatsal Goel, Module 3.4).
 * Same treatment as enrichment/research: build now, swap in the real
 * call once confirmed, keep the function signature stable.
 */
export async function processPersonalizationJob(
  job: Job<PersonalizationJobPayload>
): Promise<PersonalizationJobResult> {
  const { leadId, companyId, hiringType } = job.data;

  // ---- MOCK START - remove once Team 3's real Personalization Agent call is confirmed ----
  const mockResult: PersonalizationJobResult = {
    leadId,
    draftSubject: `(MOCKED) Following up on your ${hiringType} hiring`,
    draftBody: `(MOCKED) Draft body pending Personalization Agent integration for company ${companyId}.`,
    generatedAt: new Date().toISOString(),
  };
  // ---- MOCK END ----

  console.log(`[personalization] (MOCKED) processed lead ${leadId}`);
  return mockResult;
}
