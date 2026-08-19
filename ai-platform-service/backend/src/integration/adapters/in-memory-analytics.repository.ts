import type { AgentRunFilters, AgentRunRecord, DailyAgentRunMetrics, DailyMetricRecord } from "../../modules/3.6-analytics/services/analytics.types";

export class InMemoryAnalyticsRepository {
  readonly runs: AgentRunRecord[] = [];
  readonly daily: DailyMetricRecord[] = [];

  async recordAgentRun(record: AgentRunRecord) { const row = { ...record, id: record.id ?? crypto.randomUUID(), createdAt: new Date().toISOString() }; this.runs.push(row); return row; }
  async getAgentRuns(filters: AgentRunFilters = {}) {
    return this.runs.filter((r) => (!filters.agentName || r.agentName === filters.agentName) && (!filters.leadId || r.leadId === filters.leadId)).slice(filters.offset ?? 0, (filters.offset ?? 0) + Math.min(filters.limit ?? 100, 500));
  }
  async getAgentRunById(id: string) { return this.runs.find((r) => r.id === id) ?? null; }
  async getDailyAgentRunMetrics(_date: string): Promise<DailyAgentRunMetrics> {
    const totalRuns = this.runs.length;
    const totalCost = this.runs.reduce((sum, r) => sum + Number(r.costUsd ?? 0), 0);
    const avgLatency = totalRuns ? this.runs.reduce((sum, r) => sum + Number(r.latencyMs ?? 0), 0) / totalRuns : 0;
    return { total_runs: totalRuns, total_cost: totalCost, average_latency: avgLatency };
  }
  async getDailyMetrics(from: string, to: string, metricName?: string) { return this.daily.filter((m) => m.metricDate >= from && m.metricDate <= to && (!metricName || m.metricName === metricName)); }
  async upsertDailyMetric(metric: DailyMetricRecord) { const idx = this.daily.findIndex((m) => m.metricDate === metric.metricDate && m.metricName === metric.metricName); if (idx >= 0) this.daily[idx] = metric; else this.daily.push(metric); return metric; }
}
