import { FollowUpJob, FollowUpDecision } from '../schemas/followup-agent.schema';

export type FollowUpJobPayload = FollowUpJob;
export type FollowUpJobResult = FollowUpDecision;

// Define a minimal placeholder interface for BullMQ Queue integration
export interface Job<T = any, R = any> {
  id?: string;
  name: string;
  data: T;
  returnvalue?: R;
}
