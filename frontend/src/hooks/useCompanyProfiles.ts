import { useQuery } from "@tanstack/react-query";
import { fetchCompanyProfiles } from "@/services/company-profile.service";

export function useCompanyProfiles() {
  return useQuery({
    queryKey: ["company-profiles"],
    queryFn: fetchCompanyProfiles,
    staleTime: 60_000,
  });
}
