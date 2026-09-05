// Mirrors backend/src/services/auth.service.js `login()` / `refresh()`
// return shape exactly — do not add fields the backend doesn't send.

export type UserRole = "ADMIN" | "MANAGER" | "SALES_REP" | "RECRUITER" | "VIEWER";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}