const pool = require('../config/db')

// Get all approvals enriched with lead, company, and contact details
const getAllApprovals = async () => {
  const result = await pool.query(
    `SELECT aq.*,
            l.fit_score, l.stage AS lead_stage, l.hiring_type,
            c.name AS company, c.industry, c.domain AS company_domain,
            COALESCE(ct.full_name, 'Hiring Lead') AS contact,
            COALESCE(ct.email, CONCAT('careers@', c.domain)) AS email,
            hs.role_title AS job_title, hs.source, hs.source_url
     FROM approval_queue aq
     JOIN leads l ON aq.lead_id = l.id
     JOIN companies c ON l.company_id = c.id
     LEFT JOIN contacts ct ON l.primary_contact_id = ct.id
     LEFT JOIN hiring_signals hs ON l.hiring_signal_id = hs.id
     ORDER BY aq.created_at DESC`
  )

  return result.rows
}

// Get approval by id enriched
const getApprovalById = async (id) => {
  const result = await pool.query(
    `SELECT aq.*,
            l.fit_score, l.stage AS lead_stage, l.hiring_type,
            c.name AS company, c.industry, c.domain AS company_domain,
            COALESCE(ct.full_name, 'Hiring Lead') AS contact,
            COALESCE(ct.email, CONCAT('careers@', c.domain)) AS email,
            hs.role_title AS job_title, hs.source, hs.source_url
     FROM approval_queue aq
     JOIN leads l ON aq.lead_id = l.id
     JOIN companies c ON l.company_id = c.id
     LEFT JOIN contacts ct ON l.primary_contact_id = ct.id
     LEFT JOIN hiring_signals hs ON l.hiring_signal_id = hs.id
     WHERE aq.id = $1`,
    [id]
  )

  return result.rows[0]
}

// Get approvals by lead
const getApprovalsByLead = async (leadId) => {
  const result = await pool.query(
    `SELECT * FROM approval_queue
     WHERE lead_id = $1
     ORDER BY created_at DESC`,
    [leadId]
  )

  return result.rows
}

// Create approval
const createApproval = async (leadId, draftSubject, draftBody, status, stepNumber, reviewedBy) => {
  const result = await pool.query(
    `INSERT INTO approval_queue
    (lead_id, draft_subject, draft_body, status, step_number, reviewed_by)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *`,
    [leadId, draftSubject, draftBody, status, stepNumber, reviewedBy]
  )

  return result.rows[0]
}

// Update approval status
const updateApprovalStatus = async (id, status, reviewedBy) => {
  const result = await pool.query(
    `UPDATE approval_queue
     SET status = $2,
         reviewed_by = $3,
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, status, reviewedBy]
  )

  return result.rows[0]
}

// Update approval draft content
const updateApprovalDraft = async (id, draftSubject, draftBody) => {
  const result = await pool.query(
    `UPDATE approval_queue
     SET draft_subject = COALESCE($2, draft_subject),
         draft_body = COALESCE($3, draft_body),
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, draftSubject, draftBody]
  )

  return result.rows[0]
}

// Delete approval
const deleteApproval = async (id) => {
  await pool.query('DELETE FROM approval_queue WHERE id = $1', [id])
}

module.exports = {
  getAllApprovals,
  getApprovalById,
  getApprovalsByLead,
  createApproval,
  updateApprovalStatus,
  updateApprovalDraft,
  deleteApproval
}
