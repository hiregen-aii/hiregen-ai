import { useQuery } from "@tanstack/react-query";
import { fetchApprovals } from "@/services/approval.service";

export function useApprovals() {
  return useQuery({
    queryKey: ["approvals"],
    queryFn: fetchApprovals,
    staleTime: 15_000,
  });
}