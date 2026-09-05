import { AnalyticsService } from "../services/analytics.service";

export function createAnalyticsAgent(
  analyticsService: AnalyticsService,
) {
  return {
    async runDaily(date?: string) {
      const targetDate =
        date ?? new Date().toISOString().slice(0, 10);

      return analyticsService.generateDailyAnalytics(
        targetDate,
      );
    },
  };
}
