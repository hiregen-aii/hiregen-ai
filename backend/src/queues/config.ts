export enum QueueName {
  AUDIT_LOG = "audit-log",
  EMAIL_SEND = "email-send",
  ENRICHMENT = "enrichment",
  RESEARCH = "research",
  CLASSIFICATION = "classification",
  PERSONALIZATION = "personalization",
}

// 5 attempts, exponential backoff: 2s, 4s, 8s, 16s, 32s
export const defaultJobOptions = {
  attempts: 5,
  backoff: {
    type: "exponential" as const,
    delay: 2000,
  },
  removeOnComplete: {
    age: 3600,
    count: 1000,
  },
  removeOnFail: false,
};

export const workerConcurrency: Record<QueueName, number> = {
  [QueueName.AUDIT_LOG]: 10,
  [QueueName.EMAIL_SEND]: 5,
  [QueueName.ENRICHMENT]: 3,
  [QueueName.RESEARCH]: 3,
  [QueueName.CLASSIFICATION]: 5,
  [QueueName.PERSONALIZATION]: 3,
};
