const pool = require('../config/db')

// Get all workflow runs
const getAllWorkflowRuns = async () => {
  const result = await pool.query(
    `SELECT * FROM workflow_runs
     ORDER BY started_at DESC`
  )

  return result.rows
}

// Get workflow run by id
const getWorkflowRunById = async (id) => {
  const result = await pool.query(
    `SELECT * FROM workflow_runs
     WHERE id = $1`,
    [id]
  )

  return result.rows[0]
}

// Create workflow run
const createWorkflowRun = async (leadId, workflowName, status, n8nExecutionId, errorDetail, startedAt, completedAt) => {
  const result = await pool.query(
    `INSERT INTO workflow_runs
    (lead_id, workflow_name, status, n8n_execution_id, error_detail, started_at, completed_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`,
    [leadId, workflowName, status, n8nExecutionId, errorDetail, startedAt, completedAt]
  )

  return result.rows[0]
}

// Update workflow status
const updateWorkflowRunStatus = async (id, status, completedAt, errorDetail) => {
  const result = await pool.query(
    `UPDATE workflow_runs
     SET status = $2,
         completed_at = $3,
         error_detail = $4,
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, status, completedAt, errorDetail]
  )

  return result.rows[0]
}

// Delete workflow run
const deleteWorkflowRun = async (id) => {
  await pool.query('DELETE FROM workflow_runs WHERE id = $1', [id])
}

module.exports = {
  getAllWorkflowRuns,
  getWorkflowRunById,
  createWorkflowRun,
  updateWorkflowRunStatus,
  deleteWorkflowRun
}
