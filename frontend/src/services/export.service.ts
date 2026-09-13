import { api } from "./api";

export interface ExportFilters {
  search?: string;
  status?: string;
  hiringType?: string;
  minScore?: string | number;
}

export interface ScrapeResponse {
  totalFound: number;
  newlyAdded: number;
  duplicatesSkipped: number;
  leadsCreated: number;
}

/**
 * Triggers an authenticated download of leads as CSV or styled Excel (.xlsx).
 */
export async function downloadLeadsExport(
  format: "csv" | "xlsx" = "csv",
  filters?: ExportFilters
): Promise<void> {
  const params = new URLSearchParams();
  params.set("format", format);

  if (filters?.search) params.set("search", filters.search);
  if (filters?.status && filters.status !== "All") params.set("status", filters.status);
  if (filters?.hiringType && filters.hiringType !== "All") params.set("hiringType", filters.hiringType);
  if (filters?.minScore && filters.minScore !== "All") params.set("minScore", String(filters.minScore));

  const response = await api.get(`/export/leads?${params.toString()}`, {
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
  link.setAttribute("download", `hiregen_leads_${timestamp}.${format}`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
}

/**
 * Downloads both CSV and Excel (.xlsx) files with one click.
 */
export async function downloadBothLeadsExport(filters?: ExportFilters): Promise<void> {
  await downloadLeadsExport("csv", filters);
  await new Promise((resolve) => setTimeout(resolve, 600));
  await downloadLeadsExport("xlsx", filters);
}

/**
 * Triggers real-time targeted scraping for live hiring signals across public platforms.
 */
export async function triggerDeepScrape(
  query = "",
  location = "",
  hiringType = ""
): Promise<ScrapeResponse> {
  const { data } = await api.post<{ success: boolean; message: string; data: ScrapeResponse }>(
    "/scraper/trigger",
    { query, location, hiringType },
    { timeout: 60000 }
  );
  return data.data;
}

export interface AutoSyncStatus {
  isRunning: boolean;
  intervalMinutes: number;
  lastRunAt: string | null;
  totalSyncedCount: number;
}

export async function fetchAutoSyncStatus(): Promise<AutoSyncStatus> {
  const { data } = await api.get<{ success: boolean; data: AutoSyncStatus }>("/scraper/auto-sync");
  return data.data;
}

export async function toggleAutoSync(enabled: boolean): Promise<AutoSyncStatus> {
  const { data } = await api.post<{ success: boolean; data: AutoSyncStatus }>("/scraper/auto-sync/toggle", { enabled });
  return data.data;
}
