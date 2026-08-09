import { Queue } from "bullmq";
import { redisConnection } from "./redisConnection";
import { QueueName } from "./config";

export const dlqQueues: Record<QueueName, Queue> = {
  [QueueName.AUDIT_LOG]: new Queue(`${QueueName.AUDIT_LOG}-dlq`, { connection: redisConnection }),
  [QueueName.EMAIL_SEND]: new Queue(`${QueueName.EMAIL_SEND}-dlq`, { connection: redisConnection }),
  [QueueName.ENRICHMENT]: new Queue(`${QueueName.ENRICHMENT}-dlq`, { connection: redisConnection }),
  [QueueName.RESEARCH]: new Queue(`${QueueName.RESEARCH}-dlq`, { connection: redisConnection }),
  [QueueName.CLASSIFICATION]: new Queue(`${QueueName.CLASSIFICATION}-dlq`, { connection: redisConnection }),
  [QueueName.PERSONALIZATION]: new Queue(`${QueueName.PERSONALIZATION}-dlq`, { connection: redisConnection }),
};

export async function moveToDlq(
  queueName: QueueName,
  jobId: string,
  data: unknown,
  failedReason: string
): Promise<void> {
  const dlq = dlqQueues[queueName];
  await dlq.add("failed-job", {
    originalJobId: jobId,
    originalQueue: queueName,
    data,
    failedReason,
    movedAt: new Date().toISOString(),
  });
}
