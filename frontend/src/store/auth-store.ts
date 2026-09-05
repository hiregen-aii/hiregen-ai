import { create } from "zustand";
import { persist } from "zustand/middleware";
import { loginRequest, refreshRequest, logoutRequest } from "@/services/auth.service";
import type { AuthUser, LoginPayload } from "@/types/auth";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<string | null>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const result = await loginRequest(payload);
          set({
            user: result.user,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Login failed";
          set({ isLoading: false, error: message, isAuthenticated: false });
          throw err;
        }
      },

      logout: () => {
        const { refreshToken } = get();
        if (refreshToken) {
          // best-effort revoke; don't block the UI on it
          logoutRequest(refreshToken).catch(() => {});
        }
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return null;
        try {
          const result = await refreshRequest(refreshToken);
          set({
            user: result.user,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            isAuthenticated: true,
          });
          return result.accessToken;
        } catch {
          set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
          return null;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "hiregen-auth", // localStorage key
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);