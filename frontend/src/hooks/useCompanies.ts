import { useQuery } from "@tanstack/react-query";
import { fetchCompanies } from "@/services/companies.service";

export function useCompanies() {
  return useQuery({
    queryKey: ["companies"],
    queryFn: fetchCompanies,
    staleTime: 60_000,
  });
}