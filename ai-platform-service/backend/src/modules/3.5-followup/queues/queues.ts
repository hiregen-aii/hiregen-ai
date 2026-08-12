// TODO: INTEGRATION CONTRACT
// This is a minimal wrapper. In actual implementation, import Queue from 'bullmq'.

export const FOLLOW_UP_QUEUE_NAME = 'FOLLOW_UP';

export class MinimalQueue {
  constructor(public name: string, public config: any) {}
  
  async add(name: string, data: any, opts?: any) {
    console.log(`Job ${name} added to queue ${this.name} with data`, data);
    return { id: Math.random().toString(), name, data };
  }
}

// In the real system, this would be: 
// export const followUpQueue = new Queue(FOLLOW_UP_QUEUE_NAME, queueConfig);
export const followUpQueue = new MinimalQueue(FOLLOW_UP_QUEUE_NAME, {});
