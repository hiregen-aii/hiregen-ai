export interface ApprovalDraft {
  id: number | string;
  leadId?: string;
  company: string;
  industry: string;
  contact: string;
  email: string;
  jobTitle: string;
  aiScore: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Scheduled';
  generatedOn: string;
  subject: string;
  body: string;
}

export const approvalDrafts: ApprovalDraft[] = [];

