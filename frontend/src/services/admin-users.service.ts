import { api, extractErrorMessage } from "@/services/api";
import type { ApiEnvelope } from "@/services/api";
import type { AdminUser, UserRole } from "@/types/admin-user";

// GET /api/v1/admin/users — ADMIN only
export async function fetchUsers(): Promise<AdminUser[]> {
  try {
    const { data } = await api.get<ApiEnvelope<AdminUser[]>>("/admin/users");
    return data.data;
  } catch (err) {
    throw new Error(extractErrorMessage(err, "Failed to load users"));
  }
}

// PATCH /api/v1/admin/users/:id/role — ADMIN only
export async function updateUserRole(id: string, role: UserRole): Promise<AdminUser> {
  try {
    const { data } = await api.patch<ApiEnvelope<AdminUser>>(`/admin/users/${id}/role`, { role });
    return data.data;
  } catch (err) {
    throw new Error(extractErrorMessage(err, "Failed to update role"));
  }
}

// PATCH /api/v1/admin/users/:id/status — ADMIN only
export async function updateUserStatus(id: string, isActive: boolean): Promise<AdminUser> {
  try {
    const { data } = await api.patch<ApiEnvelope<AdminUser>>(`/admin/users/${id}/status`, {
      isActive,
    });
    return data.data;
  } catch (err) {
    throw new Error(extractErrorMessage(err, "Failed to update status"));
  }
}