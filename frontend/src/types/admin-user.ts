// Mirrors what GET /admin/users returns — see
// backend/src/repositories/user.repository.js getAllUsers()
// (password_hash intentionally excluded server-side).

export type UserRole = "ADMIN" | "MANAGER" | "SALES_REP" | "RECRUITER" | "VIEWER";

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}