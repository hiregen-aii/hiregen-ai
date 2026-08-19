const pool = require('../config/db')

// Get all agent runs
const getAllAgentRuns = async () => {
  const result = await pool.query(
    `SELECT * FROM agent_runs
     ORDER BY created_at DESC`
  )

  return result.rows
}

// Get agent run by id
const getAgentRunById = async (id) => {
  const result = await pool.query(
    `SELECT * FROM agent_runs
     WHERE id = $1`,
    [id]
  )

  return result.rows[0]
}

// Create agent run
const createAgentRun = async (
  leadId,
  agentName,
  inputData,
  inputHash,
  model,
  outputData,
  outputReference,
  status,
  latencyMs,
  costUsd,
  completedAt
) => {
  const result = await pool.query(
    `INSERT INTO agent_runs
    (lead_id, agent_name, input_data, input_hash, model, output_data, output_reference, status, latency_ms, cost_usd, completed_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *`,
    [leadId, agentName, inputData, inputHash, model, outputData, outputReference, status, latencyMs, costUsd, completedAt]
  )

  return result.rows[0]
}

// Update agent run
const updateAgentRun = async (id, outputData, status, latencyMs, costUsd, completedAt) => {
  const result = await pool.query(
    `UPDATE agent_runs
     SET output_data = $2,
         status = $3,
         latency_ms = $4,
         cost_usd = $5,
         completed_at = $6,
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, outputData, status, latencyMs, costUsd, completedAt]
  )

  return result.rows[0]
}

// Delete agent run
const deleteAgentRun = async (id) => {
  await pool.query('DELETE FROM agent_runs WHERE id = $1', [id])
}

module.exports = {
  getAllAgentRuns,
  getAgentRunById,
  createAgentRun,
  updateAgentRun,
  deleteAgentRun
}
