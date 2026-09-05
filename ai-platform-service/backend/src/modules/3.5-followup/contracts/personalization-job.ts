// TODO: INTEGRATION CONTRACT
// This is a minimal placeholder for the actual HireGen PersonalizationJob.
export interface PersonalizationJob {
  lead_id: string;
  campaign_id: string;
  step_number: number;
  
  // Follow-up specific context added to the job
  is_follow_up?: boolean;
  previous_steps_sent?: number;
  days_since_last_email?: number;
}
