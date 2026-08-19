export interface AgentRunRecord {
  id?: string;
  agentName: string;
  leadId?: string | null;
  inputHash?: string | null;
  modelUsed?: string | null;
  latencyMs?: number | null;
  costUsd?: number | null;
  outputRef?: string | null;
  createdAt?: string;
}

export interface AgentRunFilters {
  agentName?: string;
  leadId?: string;
  modelUsed?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

export interface DailyAgentRunMetrics {
  total_runs: number;
  total_cost: string | number;
  average_latency: string | number;
}

export interface DailyMetricRecord {
  metricDate: string;
  metricName: string;
  value: number;
  breakdown?: Record<string, unknown>;
}
