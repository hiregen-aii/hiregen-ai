import { useQuery } from "@tanstack/react-query";
import { fetchCompanyTimeline } from "@/services/company-profile.service";

export function useCompanyTimeline(companyId: string | null) {
  return useQuery({
    queryKey: ["company-timeline", companyId],
    queryFn: () => fetchCompanyTimeline(companyId as string),
    enabled: !!companyId,
    staleTime: 30_000,
  });
}