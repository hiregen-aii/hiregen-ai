import type { Job } from "bullmq";
import type { PersonalizationJobPayload, PersonalizationJobResult } from "../types";

// mocked until Team 3's Personalization Agent exposes a real contract
export async function processPersonalizationJob(
  job: Job<PersonalizationJobPayload>
): Promise<PersonalizationJobResult> {
  const { leadId, companyId, hiringType } = job.data;

  const result: PersonalizationJobResult = {
    leadId,
    draftSubject: `Following up on your ${hiringType} hiring`,
    draftBody: `Draft pending Personalization Agent integration for company ${companyId}.`,
    generatedAt: new Date().toISOString(),
  };

  console.log(`[personalization] (mock) processed lead ${leadId}`);
  return result;
}
