import { useQuery } from "@tanstack/react-query";
import { fetchCampaigns } from "@/services/campaigns.service";

export function useCampaigns() {
  return useQuery({
    queryKey: ["campaigns"],
    queryFn: fetchCampaigns,
    staleTime: 30_000,
  });
}