import { followUpQueue } from './queues';
import { FollowUpJobPayload } from './types';
import { FollowUpJobSchema } from '../schemas/followup-agent.schema';

export async function enqueueFollowUp(payload: FollowUpJobPayload) {
  // Validate payload before enqueuing
  const validatedPayload = FollowUpJobSchema.parse(payload);
  
  return await followUpQueue.add('process_followup', validatedPayload);
}
