const pool = require("../config/db");
const { sendOutreachEmail } = require("./email.service");
const { updateApprovalStatus } = require("../repositories/approvalQueue.repository");

let isAutopilotEnabled = process.env.AUTO_PILOT_DISPATCH === "true";
let minFitScoreThreshold = 85;
let lastAutopilotRunAt = null;
let totalDispatchedCount = 0;

function getAutopilotConfig() {
  return {
    isEnabled: isAutopilotEnabled,
    minFitScore: minFitScoreThreshold,
    lastRunAt: lastAutopilotRunAt,
    totalDispatched: totalDispatchedCount,
  };
}

function setAutopilotConfig({ enabled, minFitScore }) {
  if (typeof enabled === "boolean") {
    isAutopilotEnabled = enabled;
    process.env.AUTO_PILOT_DISPATCH = enabled ? "true" : "false";
  }
  if (typeof minFitScore === "number" && minFitScore >= 50 && minFitScore <= 100) {
    minFitScoreThreshold = minFitScore;
  }
  return getAutopilotConfig();
}

function isAutopilotActive() {
  return isAutopilotEnabled;
}

function getThreshold() {
  return minFitScoreThreshold;
}

/**
 * Executes a batch run of Autopilot: dispatches emails for all pending drafts
 * whose lead has a fit score >= minFitScoreThreshold.
 */
async function runAutopilotBatch() {
  lastAutopilotRunAt = new Date().toISOString();

  // Query pending approvals with lead details
  const result = await pool.query(
    `SELECT aq.id AS approval_id, aq.draft_subject, aq.draft_body,
            l.id AS lead_id, l.fit_score,
            c.name AS company_name,
            ct.full_name AS contact_name, ct.email AS contact_email
     FROM approval_queue aq
     JOIN leads l ON aq.lead_id = l.id
     JOIN companies c ON l.company_id = c.id
     LEFT JOIN contacts ct ON l.primary_contact_id = ct.id
     WHERE aq.status = 'PENDING' AND l.fit_score >= $1
     ORDER BY l.fit_score DESC, aq.created_at ASC
     LIMIT 50;`,
    [minFitScoreThreshold]
  );

  const pending = result.rows || [];
  let dispatched = 0;
  let failed = 0;
  const errors = [];

  for (const draft of pending) {
    const recipient = draft.contact_email || `recruiting@${draft.company_name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`;
    try {
      await sendOutreachEmail({
        to: recipient,
        subject: draft.draft_subject,
        body: draft.draft_body,
        leadId: draft.lead_id,
        approvalId: draft.approval_id,
      });

      await updateApprovalStatus(draft.approval_id, "APPROVED", null);
      dispatched++;
      totalDispatchedCount++;
    } catch (err) {
      failed++;
      errors.push({ approvalId: draft.approval_id, leadId: draft.lead_id, error: err.message });
      console.error(`[AUTOPILOT ERROR] Failed dispatching for lead ${draft.lead_id}:`, err.message);
    }
  }

  return {
    totalEligible: pending.length,
    dispatched,
    failed,
    threshold: minFitScoreThreshold,
    errors,
    executedAt: lastAutopilotRunAt,
  };
}

module.exports = {
  getAutopilotConfig,
  setAutopilotConfig,
  isAutopilotActive,
  getThreshold,
  runAutopilotBatch,
};
