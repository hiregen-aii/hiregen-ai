import { api, extractErrorMessage } from "@/services/api";
import type { ApiEnvelope } from "@/services/api";
import type { LoginPayload, LoginResponse } from "@/types/auth";

// Endpoints per backend/src/routes/auth.js, registered under /api/v1/auth.
export async function loginRequest(payload: LoginPayload): Promise<LoginResponse> {
  try {
    const { data } = await api.post<ApiEnvelope<LoginResponse>>("/auth/login", payload);
    return data.data;
  } catch (err) {
    throw new Error(extractErrorMessage(err, "Login failed"));
  }
}

export async function refreshRequest(refreshToken: string): Promise<LoginResponse> {
  try {
    const { data } = await api.post<ApiEnvelope<LoginResponse>>("/auth/refresh", { refreshToken });
    return data.data;
  } catch (err) {
    throw new Error(extractErrorMessage(err, "Session refresh failed"));
  }
}

export async function logoutRequest(refreshToken: string): Promise<void> {
  await api.post("/auth/logout", { refreshToken });
}