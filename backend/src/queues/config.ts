/**
 * Module 4.2 - Queue Processing
 * Shared configuration: queue names, default job options (retry/backoff),
 * and per-queue worker concurrency.
 */

export enum QueueName {
  AUDIT_LOG = "audit-log",
  EMAIL_SEND = "email-send",
  ENRICHMENT = "enrichment",
  RESEARCH = "research",
  CLASSIFICATION = "classification",
  PERSONALIZATION = "personalization",
}

/**
 * Retry strategy: 5 attempts, exponential backoff starting at 2s
 * (2s -> 4s -> 8s -> 16s -> 32s). After the 5th failure, the job is
 * moved to that queue's Dead Letter Queue - see dlq.ts.
 */
export const defaultJobOptions = {
  attempts: 5,
  backoff: {
    type: "exponential" as const,
    delay: 2000,
  },
  removeOnComplete: {
    age: 3600, // keep completed jobs for 1 hour
    count: 1000, // or last 1000, whichever is smaller
  },
  removeOnFail: false, // keep failed jobs around until they're moved to the DLQ
};

/**
 * How many jobs each worker processes in parallel. Enrichment/Research/
 * Personalization are lower since they call out to the AI Gateway and
 * we don't want to hammer rate limits; email/audit-log are cheap and
 * can run with higher concurrency.
 */
export const workerConcurrency: Record<QueueName, number> = {
  [QueueName.AUDIT_LOG]: 10,
  [QueueName.EMAIL_SEND]: 5,
  [QueueName.ENRICHMENT]: 3,
  [QueueName.RESEARCH]: 3,
  [QueueName.CLASSIFICATION]: 5,
  [QueueName.PERSONALIZATION]: 3,
};
