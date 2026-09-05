import { AnalyticsRepository } from "../repositories/analytics.repository";
import type {
  AgentRunFilters,
  AgentRunRecord,
} from "./analytics.types";

export interface GatewayAnalyticsLog {
  agent: string;
  leadId?: string;
  inputHash?: string;
  provider?: string;
  model?: string;
  success?: boolean;
  responseTimeMs?: number;
  costUsd?: number;
  outputRef?: string;
}

export class AnalyticsService {
  constructor(
    private readonly analyticsRepository: AnalyticsRepository,
  ) {}

  async recordGatewayRun(log: GatewayAnalyticsLog) {
    const record: AgentRunRecord = {
      agentName: log.agent,
      leadId: log.leadId ?? null,
      inputHash: log.inputHash ?? null,
      modelUsed: log.model ?? null,
      latencyMs: log.responseTimeMs ?? null,
      costUsd: log.costUsd ?? null,
      outputRef: log.outputRef ?? null,
    };
    return this.analyticsRepository.recordAgentRun(record);
  }

  async getRuns(filters: AgentRunFilters = {}) {
    return this.analyticsRepository.getAgentRuns(filters);
  }

  async getRunById(id: string) {
    return this.analyticsRepository.getAgentRunById(id);
  }

  async getDailyAnalytics(date: string) {
    const metrics =
      await this.analyticsRepository.getDailyAgentRunMetrics(date);

    return {
      date,
      metrics: {
        totalAiRuns: Number(metrics.total_runs),
        totalCostUsd: Number(metrics.total_cost),
        averageLatencyMs: Number(metrics.average_latency),
      },
    };
  }

  async generateDailyAnalytics(date: string) {
    const data = await this.getDailyAnalytics(date);

    await this.analyticsRepository.upsertDailyMetric({
      metricDate: date,
      metricName: "total_ai_runs",
      value: data.metrics.totalAiRuns,
    });

    await this.analyticsRepository.upsertDailyMetric({
      metricDate: date,
      metricName: "total_cost_usd",
      value: data.metrics.totalCostUsd,
    });

    await this.analyticsRepository.upsertDailyMetric({
      metricDate: date,
      metricName: "average_latency_ms",
      value: data.metrics.averageLatencyMs,
    });

    return data;
  }

  async getDailyMetrics(
    from: string,
    to: string,
    metricName?: string,
  ) {
    return this.analyticsRepository.getDailyMetrics(
      from,
      to,
      metricName,
    );
  }
}
