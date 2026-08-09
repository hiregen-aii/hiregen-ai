import type { Job } from "bullmq";
import type { ClassificationJobPayload, ClassificationJobResult } from "../types";

// scoring is still synchronous on Team 2's side, no queue trigger yet
export async function processClassificationJob(
  job: Job<ClassificationJobPayload>
): Promise<ClassificationJobResult> {
  const { hiringSignalId, companyId } = job.data;

  const result: ClassificationJobResult = {
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

  console.log(`[classification] (mock) processed signal ${hiringSignalId}`);
  return result;
}
