// TODO: INTEGRATION CONTRACT
// Replace with the actual Lead entity from the main repository.

export enum LeadStage {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  REPLIED = 'REPLIED',
  MEETING_BOOKED = 'MEETING_BOOKED',
  WON = 'WON',
  LOST = 'LOST'
}

export interface Lead {
  id: string;
  stage: LeadStage;
  hiring_type?: string;
  urgency?: string;
  fit_score?: number;
  primary_contact_id?: string;
  company_id?: string;
}
