import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth-store";
import { fetchHiringSignalsCount } from "@/services/hiring-signals.service";

// ADMIN/MANAGER only endpoint — for other roles we skip the call entirely
// (query stays disabled) instead of firing a request we know will 403.
export function useHiringSignalsCount() {
  const role = useAuthStore((s) => s.user?.role);
  const canView = role === "ADMIN" || role === "MANAGER";

  return useQuery({
    queryKey: ["hiring-signals-count"],
    queryFn: fetchHiringSignalsCount,
    enabled: canView,
    staleTime: 30_000,
  });
}