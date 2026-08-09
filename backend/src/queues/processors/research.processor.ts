import type { Job } from "bullmq";
import type { ResearchJobPayload, ResearchJobResult } from "../types";

// mocked until Team 2's Research Engine exposes a real contract
export async function processResearchJob(job: Job<ResearchJobPayload>): Promise<ResearchJobResult> {
  const { companyId, companyName } = job.data;

  const result: ResearchJobResult = {
    companyId,
    summary: `${companyName} has an active hiring signal.`,
    sourceUrls: [],
    completedAt: new Date().toISOString(),
  };

  console.log(`[research] (mock) processed ${companyName}`);
  return result;
}
