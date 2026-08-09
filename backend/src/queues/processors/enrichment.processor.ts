import type { Job } from "bullmq";
import type { EnrichmentJobPayload, EnrichmentJobResult } from "../types";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:3000";

interface EnrichApiResponse {
  success: boolean;
  message: string;
  data: EnrichmentJobResult;
}

export async function processEnrichmentJob(job: Job<EnrichmentJobPayload>): Promise<EnrichmentJobResult> {
  const { hiringSignalId, company, contact } = job.data;

  const res = await fetch(`${BACKEND_API_URL}/api/v1/hiring-signals/${hiringSignalId}/enrich`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ company, contact }),
  });

  const result = (await res.json()) as EnrichApiResponse;

  if (!res.ok || !result.success) {
    throw new Error(result.message || `enrichment request failed with status ${res.status}`);
  }

  console.log(`[enrichment] completed for signal ${hiringSignalId}`);
  return result.data;
}
