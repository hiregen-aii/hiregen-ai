import type {
  AgentRunFilters,
  AgentRunRecord,
  DailyAgentRunMetrics,
  DailyMetricRecord,
} from "../services/analytics.types";

export interface AnalyticsDb {
  query<T = any>(
    text: string,
    values?: unknown[],
  ): Promise<{ rows: T[] }>;
}

export class AnalyticsRepository {
  constructor(private readonly db: AnalyticsDb) {}

  async recordAgentRun(record: AgentRunRecord) {
    const result = await this.db.query(
      `
      INSERT INTO agent_runs (
        agent_name, lead_id, input_hash, model_used,
        latency_ms, cost_usd, output_ref
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
      `,
      [
        record.agentName,
        record.leadId ?? null,
        record.inputHash ?? null,
        record.modelUsed ?? null,
        record.latencyMs ?? null,
        record.costUsd ?? null,
        record.outputRef ?? null,
      ],
    );
    return result.rows[0];
  }

  async getAgentRuns(filters: AgentRunFilters = {}) {
    const values: unknown[] = [];
    const where: string[] = [];

    if (filters.agentName) {
      values.push(filters.agentName);
      where.push(`agent_name = $${values.length}`);
    }
    if (filters.leadId) {
      values.push(filters.leadId);
      where.push(`lead_id = $${values.length}`);
    }
    if (filters.modelUsed) {
      values.push(filters.modelUsed);
      where.push(`model_used = $${values.length}`);
    }
    if (filters.from) {
      values.push(filters.from);
      where.push(`created_at >= $${values.length}::timestamptz`);
    }
    if (filters.to) {
      values.push(filters.to);
      where.push(`created_at < $${values.length}::timestamptz`);
    }

    const limit = Math.min(filters.limit ?? 100, 500);
    const offset = Math.max(filters.offset ?? 0, 0);
    values.push(limit);
    const limitParam = `$${values.length}`;
    values.push(offset);
    const offsetParam = `$${values.length}`;

    const result = await this.db.query(
      `
      SELECT *
      FROM agent_runs
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY created_at DESC
      LIMIT ${limitParam}
      OFFSET ${offsetParam};
      `,
      values,
    );
    return result.rows;
  }

  async getAgentRunById(id: string) {
    const result = await this.db.query(
      `SELECT * FROM agent_runs WHERE id = $1;`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async getDailyAgentRunMetrics(
    date: string,
  ): Promise<DailyAgentRunMetrics> {
    const result = await this.db.query<DailyAgentRunMetrics>(
      `
      SELECT
        COUNT(*)::int AS total_runs,
        COALESCE(SUM(cost_usd), 0) AS total_cost,
        COALESCE(AVG(latency_ms), 0) AS average_latency
      FROM agent_runs
      WHERE created_at >= $1::date
        AND created_at < ($1::date + INTERVAL '1 day');
      `,
      [date],
    );
    return result.rows[0];
  }

  async getDailyMetrics(
    from: string,
    to: string,
    metricName?: string,
  ) {
    const values: unknown[] = [from, to];
    let metricClause = "";
    if (metricName) {
      values.push(metricName);
      metricClause = `AND metric_name = $${values.length}`;
    }

    const result = await this.db.query(
      `
      SELECT *
      FROM analytics_daily
      WHERE metric_date >= $1::date
        AND metric_date <= $2::date
        ${metricClause}
      ORDER BY metric_date ASC, metric_name ASC;
      `,
      values,
    );
    return result.rows;
  }

  async upsertDailyMetric(metric: DailyMetricRecord) {
    const result = await this.db.query(
      `
      INSERT INTO analytics_daily (
        metric_date, metric_name, value, breakdown
      )
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (metric_date, metric_name)
      DO UPDATE SET
        value = EXCLUDED.value,
        breakdown = EXCLUDED.breakdown
      RETURNING *;
      `,
      [
        metric.metricDate,
        metric.metricName,
        metric.value,
        metric.breakdown
          ? JSON.stringify(metric.breakdown)
          : null,
      ],
    );
    return result.rows[0];
  }
}
