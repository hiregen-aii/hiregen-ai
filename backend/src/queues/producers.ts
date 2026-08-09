import {
  auditLogQueue,
  emailSendQueue,
  enrichmentQueue,
  researchQueue,
  classificationQueue,
  personalizationQueue,
} from "./queues";
import type {
  AuditLogJobPayload,
  EmailSendJobPayload,
  EnrichmentJobPayload,
  ResearchJobPayload,
  ClassificationJobPayload,
  PersonalizationJobPayload,
} from "./types";

export async function enqueueAuditLog(payload: AuditLogJobPayload) {
  return auditLogQueue.add("audit-log", payload);
}

export async function enqueueEmailSend(payload: EmailSendJobPayload) {
  return emailSendQueue.add("email-send", payload);
}

export async function enqueueEnrichment(payload: EnrichmentJobPayload) {
  return enrichmentQueue.add("enrichment", payload);
}

export async function enqueueResearch(payload: ResearchJobPayload) {
  return researchQueue.add("research", payload);
}

export async function enqueueClassification(payload: ClassificationJobPayload) {
  return classificationQueue.add("classification", payload);
}

export async function enqueuePersonalization(payload: PersonalizationJobPayload) {
  return personalizationQueue.add("personalization", payload);
}
