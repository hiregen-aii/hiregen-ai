import { useQuery } from "@tanstack/react-query";
import { fetchCandidates, fetchCandidateStats } from "@/services/candidates.service";
import type { CandidateFilters } from "@/types/candidate";

export function useCandidates(filters?: CandidateFilters) {
  return useQuery({
    queryKey: ["candidates", filters],
    queryFn: () => fetchCandidates(filters),
    staleTime: 30_000,
  });
}

export function useCandidateStats() {
  return useQuery({
    queryKey: ["candidate-stats"],
    queryFn: fetchCandidateStats,
    staleTime: 60_000,
  });
}
