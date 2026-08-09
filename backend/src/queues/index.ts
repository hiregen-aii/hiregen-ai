import { startWorkers, attachQueueLevelEvents } from "./workers";

export * from "./types";
export * from "./producers";
export { allQueues } from "./queues";

export function startQueueProcessing() {
  const workers = startWorkers();
  const queueEvents = attachQueueLevelEvents();
  console.log(`[queue] ${workers.length} workers started`);
  return { workers, queueEvents };
}
