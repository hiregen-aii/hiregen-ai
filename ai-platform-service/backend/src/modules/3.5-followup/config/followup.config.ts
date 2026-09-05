export const DEFAULT_MIN_DAYS_BETWEEN_FOLLOWUPS = process.env.MIN_DAYS_BETWEEN_FOLLOWUPS 
  ? parseInt(process.env.MIN_DAYS_BETWEEN_FOLLOWUPS, 10) 
  : 7;

export const DEFAULT_MAX_FOLLOWUP_STEPS = process.env.MAX_FOLLOWUP_STEPS
  ? parseInt(process.env.MAX_FOLLOWUP_STEPS, 10)
  : 3;
