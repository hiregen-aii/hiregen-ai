import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/auth-store";

// Backend runs Fastify on port 3000, all routes under /api/v1
// (see backend/src/server.js — every route module is registered
// with an explicit /api/v1/... prefix).
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Attach access token to every outgoing request.
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

// Backend envelope is always { success, data, error, meta }.
// On 401, try exactly one silent refresh (via /auth/refresh) before
// giving up and logging the user out — avoids infinite retry loops.
let refreshPromise: Promise<string | null> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    const isAuthEndpoint = originalRequest?.url?.includes("/auth/");

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      if (!refreshPromise) {
        refreshPromise = useAuthStore
          .getState()
          .refreshAccessToken()
          .finally(() => {
            refreshPromise = null;
          });
      }

      const newToken = await refreshPromise;

      if (newToken) {
        originalRequest.headers.set("Authorization", `Bearer ${newToken}`);
        return api(originalRequest);
      }

      useAuthStore.getState().logout();
    }

    return Promise.reject(error);
  }
);

// IMPORTANT — the backend is NOT consistent about its envelope shape.
// auth.js / admin.js use the shared success()/error() helper:
//   { success, data, error: { message } | null, meta: { requestId } }
// leads/companies/contacts/hiring-signals controllers hand-roll replies:
//   success -> { success, data }
//   failure -> { success: false, message: "..." }   (no `error`, no `meta`)
// Every controller DOES put the payload under `data` on success, so
// `response.data.data` is safe everywhere. Error messages are not —
// use extractErrorMessage() below instead of reaching into err.error.message.
export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  error?: { message: string } | null;
  meta?: { requestId: string | null };
  message?: string; // present on the hand-rolled error shape instead of `error`
}

export function extractErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(err)) {
    const body = err.response?.data as { error?: { message?: string }; message?: string } | undefined;
    return body?.error?.message ?? body?.message ?? fallback;
  }
  return err instanceof Error ? err.message : fallback;
}