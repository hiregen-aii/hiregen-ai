import type { Job } from "bullmq";
import type { AuditLogJobPayload } from "../types";
// import { db } from "@hiregen/database"; // Team 1's exported DB client - wire in once the import path is confirmed

/**
 * CONFIRMED contract (Anuj Mishra, Team 1).
 * action + entity_name are required; id and created_at must NOT be
 * supplied - Postgres auto-generates both.
 */
export async function processAuditLogJob(job: Job<AuditLogJobPayload>): Promise<void> {
  const { user_id, action, entity_name, entity_id, before_snapshot, after_snapshot } = job.data;

  if (!action || !entity_name) {
    throw new Error(
      "audit_log write rejected: 'action' and 'entity_name' are required (per Team 1's schema rules)"
    );
  }

  // TODO: swap in the real insert once packages/database is available:
  // await db.auditLog.create({
  //   data: { user_id, action, entity_name, entity_id, before_snapshot, after_snapshot },
  // });

  console.log(`[audit-log] ${action} on ${entity_name} (entity_id: ${entity_id ?? "n/a"})`);
}
