import { api, extractErrorMessage } from "@/services/api";
import type { ApiEnvelope } from "@/services/api";

// GET /api/v1/hiring-signals — restricted to ADMIN, MANAGER only
// (see backend/src/routes/hiring-signals.routes.js). SALES_REP/RECRUITER/
// VIEWER get a 403 here — callers must handle that gracefully, not treat
// it as a hard failure.
export async function fetchHiringSignalsCount(): Promise<number> {
  try {
    const { data } = await api.get<ApiEnvelope<unknown[]>>("/hiring-signals");
    return data.data.length;
  } catch (err) {
    throw new Error(extractErrorMessage(err, "Failed to load hiring signals"));
  }
}