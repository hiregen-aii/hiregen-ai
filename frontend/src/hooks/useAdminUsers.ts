import { useQuery } from "@tanstack/react-query";
import { fetchUsers } from "@/services/admin-users.service";

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: fetchUsers,
    staleTime: 15_000,
  });
}