import { useQuery } from "@tanstack/react-query";
import { fetchDailyAnalytics, fetchMonthlyAnalytics } from "@/services/analytics.service";

export function useDailyAnalytics() {
  return useQuery({
    queryKey: ["analytics-daily"],
    queryFn: fetchDailyAnalytics,
    staleTime: 60_000,
  });
}

export function useMonthlyAnalytics() {
  return useQuery({
    queryKey: ["analytics-monthly"],
    queryFn: fetchMonthlyAnalytics,
    staleTime: 60_000,
  });
}