import { useQuery } from "@tanstack/react-query";
import { fetchLeads } from "@/services/leads.service";

export function useLeads() {
  return useQuery({
    queryKey: ["leads"],
    queryFn: fetchLeads,
    staleTime: 30_000, // avoid refetching on every widget mount within 30s
  });
}