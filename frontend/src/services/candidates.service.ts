import { api } from "./api";
import type { Candidate, CandidateStats, CandidateFilters, CandidateStatus } from "@/types/candidate";

export interface CreateCandidatePayload {
  fullName: string;
  email: string;
  phone?: string;
  headline: string;
  currentCompany?: string;
  location?: string;
  skills?: string[];
  experienceYears?: number;
  preferredRole?: string;
  expectedSalary?: string;
  noticePeriod?: string;
  hiringType?: string;
  status?: CandidateStatus;
  source?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  fitScore?: number;
  bio?: string;
}

export interface UpdateCandidatePayload {
  fullName?: string;
  phone?: string;
  headline?: string;
  currentCompany?: string;
  location?: string;
  skills?: string[];
  experienceYears?: number;
  preferredRole?: string;
  expectedSalary?: string;
  noticePeriod?: string;
  hiringType?: string;
  status?: CandidateStatus;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  fitScore?: number;
  bio?: string;
}

export interface SyncCandidatesResponse {
  success: boolean;
  newlyAdded: number;
  updatedCount: number;
  source: string;
}

/**
 * Fetch candidates with optional search and filters.
 */
export async function fetchCandidates(filters?: CandidateFilters): Promise<Candidate[]> {
  const params = new URLSearchParams();
  if (filters?.search) params.set("search", filters.search);
  if (filters?.location && filters.location !== "All Locations" && filters.location !== "All") {
    params.set("location", filters.location);
  }
  if (filters?.skill && filters.skill !== "All Skills" && filters.skill !== "All") {
    params.set("skill", filters.skill);
  }
  if (filters?.status && filters.status !== "All Statuses" && filters.status !== "All") {
    params.set("status", filters.status);
  }
  if (filters?.availability && filters.availability !== "All") {
    params.set("availability", filters.availability);
  }
  if (filters?.experience && filters.experience !== "All") {
    params.set("experience", filters.experience);
  }
  if (filters?.minScore && filters.minScore !== "All") {
    params.set("minScore", filters.minScore);
  }

  const { data } = await api.get<{ success: boolean; data: Candidate[] }>(
    `/candidates?${params.toString()}`
  );
  return data.data;
}

/**
 * Fetch candidate pool high-level statistics.
 */
export async function fetchCandidateStats(): Promise<CandidateStats> {
  const { data } = await api.get<{ success: boolean; data: CandidateStats }>(
    "/candidates/stats"
  );
  return data.data;
}

/**
 * Trigger live talent scraping from Indian tech hubs and developer communities.
 */
export async function triggerCandidateSync(): Promise<SyncCandidatesResponse> {
  const { data } = await api.post<{ success: boolean; data: SyncCandidatesResponse; message: string }>(
    "/candidates/sync",
    {},
    { timeout: 60000 }
  );
  return data.data;
}

/**
 * Create a candidate profile.
 */
export async function createCandidate(payload: CreateCandidatePayload): Promise<Candidate> {
  const { data } = await api.post<{ success: boolean; data: Candidate }>(
    "/candidates",
    payload
  );
  return data.data;
}

/**
 * Update candidate status or details.
 */
export async function updateCandidate(id: string, payload: UpdateCandidatePayload): Promise<Candidate> {
  const { data } = await api.put<{ success: boolean; data: Candidate }>(
    `/candidates/${id}`,
    payload
  );
  return data.data;
}

/**
 * Delete a candidate profile.
 */
export async function deleteCandidate(id: string): Promise<void> {
  await api.delete(`/candidates/${id}`);
}

/**
 * Dedicated export for Candidates (CSV or styled Excel .xlsx).
 * Completely separate from company leads export.
 */
export async function downloadCandidatesExport(
  format: "csv" | "xlsx" = "csv",
  filters?: CandidateFilters
): Promise<void> {
  const params = new URLSearchParams();
  params.set("format", format);

  if (filters?.search) params.set("search", filters.search);
  if (filters?.location && filters.location !== "All Locations" && filters.location !== "All") {
    params.set("location", filters.location);
  }
  if (filters?.skill && filters.skill !== "All Skills" && filters.skill !== "All") {
    params.set("skill", filters.skill);
  }
  if (filters?.status && filters.status !== "All Statuses" && filters.status !== "All") {
    params.set("status", filters.status);
  }
  if (filters?.availability && filters.availability !== "All") {
    params.set("availability", filters.availability);
  }
  if (filters?.experience && filters.experience !== "All") {
    params.set("experience", filters.experience);
  }
  if (filters?.minScore && filters.minScore !== "All") {
    params.set("minScore", filters.minScore);
  }

  const response = await api.get(`/candidates/export?${params.toString()}`, {
    responseType: "blob",
  });

  const blobType =
    format === "xlsx"
      ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      : "text/csv;charset=utf-8";

  const blob = new Blob([response.data], { type: blobType });
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  link.setAttribute("download", `hiregen_candidates_india_${timestamp}.${format}`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
}

/**
 * Downloads both CSV and Excel (.xlsx) workbooks for Candidates.
 */
export async function downloadBothCandidatesExport(filters?: CandidateFilters): Promise<void> {
  await downloadCandidatesExport("csv", filters);
  await new Promise((resolve) => setTimeout(resolve, 600));
  await downloadCandidatesExport("xlsx", filters);
}
