import { Queue } from "bullmq";
import { redisConnection } from "./redisConnection";
import { QueueName, defaultJobOptions } from "./config";

export const auditLogQueue = new Queue(QueueName.AUDIT_LOG, {
  connection: redisConnection,
  defaultJobOptions,
});

export const emailSendQueue = new Queue(QueueName.EMAIL_SEND, {
  connection: redisConnection,
  defaultJobOptions,
});

export const enrichmentQueue = new Queue(QueueName.ENRICHMENT, {
  connection: redisConnection,
  defaultJobOptions,
});

export const researchQueue = new Queue(QueueName.RESEARCH, {
  connection: redisConnection,
  defaultJobOptions,
});

export const classificationQueue = new Queue(QueueName.CLASSIFICATION, {
  connection: redisConnection,
  defaultJobOptions,
});

export const personalizationQueue = new Queue(QueueName.PERSONALIZATION, {
  connection: redisConnection,
  defaultJobOptions,
});

export const allQueues = [
  auditLogQueue,
  emailSendQueue,
  enrichmentQueue,
  researchQueue,
  classificationQueue,
  personalizationQueue,
];
