import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Users, ShieldCheck, ShieldOff } from "lucide-react";

import { useAdminUsers } from "@/hooks/useAdminUsers";
import { useAuthStore } from "@/store/auth-store";
import { updateUserRole, updateUserStatus } from "@/services/admin-users.service";
import type { AdminUser, UserRole } from "@/types/admin-user";

const ROLES: UserRole[] = ["ADMIN", "MANAGER", "SALES_REP", "RECRUITER", "VIEWER"];

const ROLE_STYLES: Record<UserRole, string> = {
  ADMIN: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  MANAGER: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  SALES_REP: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  RECRUITER: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  VIEWER: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
};

const AdminPage = () => {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);
  const { data: users, isLoading, isError, error } = useAdminUsers();

  const [actioningId, setActioningId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleRoleChange = async (user: AdminUser, role: UserRole) => {
    setActioningId(user.id);
    setActionError(null);
    try {
      await updateUserRole(user.id, role);
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setActioningId(null);
    }
  };

  const handleToggleStatus = async (user: AdminUser) => {
    setActioningId(user.id);
    setActionError(null);
    try {
      await updateUserStatus(user.id, !user.is_active);
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Administration</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Manage users and roles.</p>
      </div>

      {actionError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {actionError}
        </div>
      )}

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error instanceof Error ? error.message : "Failed to load users"}
        </div>
      )}

      {!isLoading && !isError && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-[#111827]">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Joined</th>
                <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(users ?? []).map((user) => {
                const isSelf = user.id === currentUser?.id;
                return (
                  <tr key={user.id} className="border-t border-slate-100 dark:border-slate-700">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-600 dark:bg-violet-900/30">
                          {user.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {user.full_name} {isSelf && <span className="text-xs text-slate-400">(you)</span>}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        disabled={isSelf || actioningId === user.id}
                        onChange={(e) => handleRoleChange(user, e.target.value as UserRole)}
                        className={`rounded-full border-0 px-3 py-1 text-xs font-semibold disabled:opacity-60 ${ROLE_STYLES[user.role]}`}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          user.is_active
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                        }`}
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        disabled={isSelf || actioningId === user.id}
                        title={user.is_active ? "Deactivate" : "Activate"}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-slate-800"
                      >
                        {user.is_active ? (
                          <ShieldOff className="h-4 w-4" />
                        ) : (
                          <ShieldCheck className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}

              {(users ?? []).length === 0 && (
                <tr>
                  <td colSpan={5} className="py-14 text-center text-slate-500 dark:text-slate-400">
                    <Users className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPage;