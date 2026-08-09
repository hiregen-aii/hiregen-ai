import type { Job } from "bullmq";
import type { AuditLogJobPayload } from "../types";
// import { db } from "@hiregen/database";

export async function processAuditLogJob(job: Job<AuditLogJobPayload>): Promise<void> {
  const { user_id, action, entity_name, entity_id, before_snapshot, after_snapshot } = job.data;

  if (!action || !entity_name) {
    throw new Error("audit_log write rejected: action and entity_name are required");
  }

  // await db.auditLog.create({
  //   data: { user_id, action, entity_name, entity_id, before_snapshot, after_snapshot },
  // });

  console.log(`[audit-log] ${action} on ${entity_name} (${entity_id ?? "n/a"})`);
}
