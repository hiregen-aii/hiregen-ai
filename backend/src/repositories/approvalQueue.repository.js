const pool = require('../config/db')

// Get all approvals
const getAllApprovals = async () => {
  const result = await pool.query(
    `SELECT * FROM approval_queue
     ORDER BY created_at DESC`
  )

  return result.rows
}

// Get approval by id
const getApprovalById = async (id) => {
  const result = await pool.query(
    `SELECT * FROM approval_queue
     WHERE id = $1`,
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
  deleteApproval
}
