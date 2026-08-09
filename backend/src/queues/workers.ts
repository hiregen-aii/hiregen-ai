import { Worker, QueueEvents, type Job } from "bullmq";
import { redisConnection } from "./redisConnection";
import { QueueName, workerConcurrency } from "./config";
import { moveToDlq } from "./dlq";

import { processAuditLogJob } from "./processors/auditLog.processor";
import { processEmailSendJob } from "./processors/emailSend.processor";
import { processEnrichmentJob } from "./processors/enrichment.processor";
import { processResearchJob } from "./processors/research.processor";
import { processClassificationJob } from "./processors/classification.processor";
import { processPersonalizationJob } from "./processors/personalization.processor";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const processors: Record<QueueName, (job: Job<any>) => Promise<unknown>> = {
  [QueueName.AUDIT_LOG]: processAuditLogJob,
  [QueueName.EMAIL_SEND]: processEmailSendJob,
  [QueueName.ENRICHMENT]: processEnrichmentJob,
  [QueueName.RESEARCH]: processResearchJob,
  [QueueName.CLASSIFICATION]: processClassificationJob,
  [QueueName.PERSONALIZATION]: processPersonalizationJob,
};

export function startWorkers(): Worker[] {
  return (Object.values(QueueName) as QueueName[]).map((queueName) => {
    const worker = new Worker(queueName, processors[queueName], {
      connection: redisConnection,
      concurrency: workerConcurrency[queueName],
    });

    attachWorkerEventListeners(worker, queueName);
    return worker;
  });
}

function attachWorkerEventListeners(worker: Worker, queueName: QueueName): void {
  worker.on("active", (job) => {
    console.log(`[${queueName}] active - job ${job.id}`);
  });

  worker.on("completed", (job) => {
    console.log(`[${queueName}] completed - job ${job.id}`);
  });

  worker.on("failed", async (job, err) => {
    console.error(`[${queueName}] failed - job ${job?.id}: ${err.message}`);

    const exhaustedRetries = job && job.attemptsMade >= (job.opts.attempts ?? 1);
    if (job && exhaustedRetries) {
      await moveToDlq(queueName, String(job.id), job.data, err.message);
      console.warn(`[${queueName}] job ${job.id} moved to DLQ`);
    }
  });

  worker.on("stalled", (jobId) => {
    console.warn(`[${queueName}] stalled - job ${jobId}`);
  });
}

export function attachQueueLevelEvents(): QueueEvents[] {
  return (Object.values(QueueName) as QueueName[]).map((queueName) => {
    const queueEvents = new QueueEvents(queueName, { connection: redisConnection });
    queueEvents.on("waiting", ({ jobId }) => {
      console.log(`[${queueName}] waiting - job ${jobId}`);
    });
    return queueEvents;
  });
}
