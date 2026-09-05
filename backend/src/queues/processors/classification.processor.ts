import type { Job } from "bullmq";
import type { ClassificationJobPayload, ClassificationJobResult } from "../types";

/**
 * PARTIALLY CONFIRMED. Kanduru Rakshitha (Module 2.5) confirmed the
 * output shape below field-for-field, but noted her team hasn't
 * integrated n8n queue/event publishing yet - scoring currently happens
 * synchronously right after signal processing, not via a queue. So the
 * *trigger* into this job is still a placeholder; the *result* shape is
 * real and should be kept exactly as given once wired up for real.
 */
export async function processClassificationJob(
  job: Job<ClassificationJobPayload>
): Promise<ClassificationJobResult> {
  const { hiringSignalId, companyId } = job.data;

  // ---- MOCK START - remove once Team 2 exposes real classification output ----
  const mockResult: ClassificationJobResult = {
    leadId: "mock-lead-id",
    companyId,
    hiringSignalId,
    primaryContactId: "mock-contact-id",
    hiringType: "FULL_TIME",
    fitScore: 0,
    urgency: "LOW",
    stage: "NEW",
    ownerId: "mock-owner-id",
    updatedAt: new Date().toISOString(),
  };
  // ---- MOCK END ----

  console.log(`[classification] (MOCKED) processed signal ${hiringSignalId} for company ${companyId}`);
  return mockResult;
}
