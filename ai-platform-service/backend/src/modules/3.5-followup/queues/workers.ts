// TODO: INTEGRATION CONTRACT
// Minimal Worker abstraction. In reality, import Worker from 'bullmq'.
export class MinimalWorker {
  constructor(public name: string, public processor: Function, public config: any) {}
}

import { FOLLOW_UP_QUEUE_NAME } from './queues';
import { processFollowUpJob } from './processors/followup.processor';

// Example of how the worker would be registered.
// export const followUpWorker = new Worker(FOLLOW_UP_QUEUE_NAME, processFollowUpJob, queueConfig);
export const followUpWorker = new MinimalWorker(FOLLOW_UP_QUEUE_NAME, processFollowUpJob, {});
