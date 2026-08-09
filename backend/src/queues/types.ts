export interface AuditLogJobPayload {
  user_id: string | null;
  action: string;
  entity_name: string;
  entity_id?: string | null;
  before_snapshot?: Record<string, unknown> | null;
  after_snapshot?: Record<string, unknown> | null;
}

export interface EmailSendJobPayload {
  recipient: string;
  subject: string;
  body: string;
  templateId?: string;
}

export interface CompanyEnrichmentInput {
  industry?: string;
  sizeRange?: string;
  linkedinUrl?: string;
}

export interface ContactEnrichmentInput {
  fullName?: string;
  title?: string;
  email: string;
  linkedinUrl?: string;
  verified?: boolean;
}

export interface EnrichmentJobPayload {
  hiringSignalId: string;
  company?: CompanyEnrichmentInput;
  contact?: ContactEnrichmentInput;
}

export interface CompanyRecord {
  id: string;
  name: string;
  domain: string | null;
  industry: string | null;
  size_range: string | null;
  linkedin_url: string | null;
}

export interface ContactRecord {
  id: string;
  company_id: string;
  full_name: string | null;
  title: string | null;
  email: string;
  linkedin_url: string | null;
  verified: boolean;
}

export interface HiringSignalRecord {
  id: string;
  company_id: string;
  status: string;
  [key: string]: unknown;
}

export interface EnrichmentJobResult {
  hiringSignal: HiringSignalRecord;
  company: CompanyRecord;
  contact: ContactRecord | null;
}

export interface ResearchJobPayload {
  companyId: string;
  companyName: string;
}

export interface ResearchJobResult {
  companyId: string;
  summary: string;
  sourceUrls: string[];
  completedAt: string;
}

export interface ClassificationJobPayload {
  hiringSignalId: string;
  companyId: string;
}

export interface ClassificationJobResult {
  leadId: string;
  companyId: string;
  hiringSignalId: string;
  primaryContactId: string;
  hiringType: string;
  fitScore: number;
  urgency: string;
  stage: string;
  ownerId: string;
  updatedAt: string;
}

export interface PersonalizationJobPayload {
  leadId: string;
  companyId: string;
  hiringType: string;
}

export interface PersonalizationJobResult {
  leadId: string;
  draftSubject: string;
  draftBody: string;
  generatedAt: string;
}
