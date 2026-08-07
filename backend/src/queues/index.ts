import { startWorkers, attachQueueLevelEvents } from "./workers";

export * from "./types";
export * from "./producers";
export { allQueues } from "./queues";

/**
 * Call this once when the backend boots (e.g. from apps/backend/src/server.ts)
 * to start all 6 workers and their event listeners.
 */
export function startQueueProcessing() {
  const workers = startWorkers();
  const queueEvents = attachQueueLevelEvents();
  console.log(`[queue] ${workers.length} workers started across ${Object.keys(workers).length} queues`);
  return { workers, queueEvents };
}
