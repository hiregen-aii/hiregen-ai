import {
  enqueueAuditLog,
  enqueueEmailSend,
  enqueueEnrichment,
  enqueueResearch,
  enqueueClassification,
  enqueuePersonalization,
} from "./producers";

async function main() {
  await enqueueAuditLog({
    user_id: null,
    action: "LEAD_STAGE_UPDATED",
    entity_name: "leads",
    entity_id: "sample-lead-id",
    before_snapshot: { stage: "NEW", fitScore: 0 },
    after_snapshot: { stage: "RESEARCHED", fitScore: 82 },
  });

  await enqueueEmailSend({
    recipient: "test@example.com",
    subject: "Sample outreach email",
    body: "This is a sample job for local queue testing.",
  });

  await enqueueEnrichment({
    hiringSignalId: "sample-signal-id",
    contact: { email: "hr@sample-company.com", fullName: "Sample HR" },
  });

  await enqueueResearch({
    companyId: "sample-company-id",
    companyName: "Sample Company Inc",
  });

  await enqueueClassification({
    hiringSignalId: "sample-signal-id",
    companyId: "sample-company-id",
  });

  await enqueuePersonalization({
    leadId: "sample-lead-id",
    companyId: "sample-company-id",
    hiringType: "FULL_TIME",
  });

  console.log("sample jobs added to all 6 queues");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
