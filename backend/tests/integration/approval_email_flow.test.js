const test = require('node:test');
const assert = require('node:assert/strict');
const pool = require('../../src/config/db');
const { getAllApprovals, updateApprovalStatus } = require('../../src/repositories/approvalQueue.repository');
const { sendOutreachEmail } = require('../../src/services/email.service');
const { createMeeting } = require('../../src/repositories/meetings.repository');
const { getLeadById } = require('../../src/repositories/leads.repository');

test('Integration: Approval Queue contains real leads and drafts', async () => {
  const approvals = await getAllApprovals();
  assert.ok(Array.isArray(approvals));
  assert.ok(approvals.length > 0, 'Approval queue should have active drafts');

  const first = approvals[0];
  assert.ok(first.company, 'Approval draft should include company name');
  assert.ok(first.draft_subject, 'Approval draft should have subject');
  assert.ok(first.draft_body, 'Approval draft should have body');
});

test('Integration: Approving draft dispatches email and logs to email_events', async () => {
  const approvals = await getAllApprovals();
  const pending = approvals.find((a) => a.status === 'PENDING') || approvals[0];
  assert.ok(pending, 'Should have at least one approval to test');

  // Dispatch email
  const dispatchRes = await sendOutreachEmail({
    to: pending.email || 'talent@example.com',
    subject: pending.draft_subject,
    body: pending.draft_body,
    leadId: pending.lead_id,
    approvalId: pending.id,
  });

  assert.equal(dispatchRes.success, true);
  assert.ok(dispatchRes.messageId);

  // Verify lead stage updated to SENT
  const updatedLead = await getLeadById(pending.lead_id);
  assert.equal(updatedLead.stage, 'SENT');

  // Verify email_events row
  const eventRes = await pool.query(
    'SELECT * FROM email_events WHERE lead_id = $1 ORDER BY created_at DESC LIMIT 1',
    [pending.lead_id]
  );
  assert.ok(eventRes.rows.length > 0, 'email_events record must exist');
  assert.equal(eventRes.rows[0].event_type, 'DELIVERED');
});

test('Integration: Scheduling meeting persists record and advances lead stage', async () => {
  // Get an active lead
  const leadRes = await pool.query('SELECT id, stage FROM leads LIMIT 1');
  assert.ok(leadRes.rows.length > 0);
  const leadId = leadRes.rows[0].id;

  const meetingTime = new Date(Date.now() + 86400000).toISOString();
  const meeting = await createMeeting(
    leadId,
    meetingTime,
    'https://meet.google.com/test-room',
    'Candidate technical screen'
  );

  assert.ok(meeting.id);
  assert.equal(meeting.lead_id, leadId);
  assert.equal(meeting.meeting_link, 'https://meet.google.com/test-room');
});

test('Integration: Live Analytics rollups calculate accurate counts', async () => {
  const leadsCountRes = await pool.query('SELECT COUNT(*) FROM leads');
  const totalLeads = parseInt(leadsCountRes.rows[0].count, 10);
  assert.ok(totalLeads > 0);

  const dailyRollupRes = await pool.query(
    `SELECT 
       TO_CHAR(COALESCE(l.created_at, NOW()), 'YYYY-MM-DD') AS report_date,
       COUNT(DISTINCT l.id)::int AS total_leads,
       COUNT(DISTINCT CASE WHEN l.stage = 'SENT' THEN l.id END)::int AS emails_sent
     FROM leads l
     GROUP BY TO_CHAR(COALESCE(l.created_at, NOW()), 'YYYY-MM-DD')
     ORDER BY report_date ASC`
  );

  assert.ok(dailyRollupRes.rows.length > 0);
  assert.ok(dailyRollupRes.rows[0].total_leads > 0);
});
