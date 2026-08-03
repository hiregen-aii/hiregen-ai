const pool = require('../config/db')

// Get all leads
const getAllLeads = async () => {
  const result = await pool.query(
    `SELECT * FROM leads
     ORDER BY created_at DESC`
  )

  return result.rows
}

// Get lead by id
const getLeadById = async (id) => {
  const result = await pool.query(
    `SELECT * FROM leads
     WHERE id = $1`,
    [id]
  )

  return result.rows[0]
}

// Get leads by company
const getLeadsByCompany = async (companyId) => {
  const result = await pool.query(
    `SELECT * FROM leads
     WHERE company_id = $1
     ORDER BY created_at DESC`,
    [companyId]
  )

  return result.rows
}

// Get leads by owner
const getLeadsByOwner = async (ownerId) => {
  const result = await pool.query(
    `SELECT * FROM leads
     WHERE owner_id = $1
     ORDER BY created_at DESC`,
    [ownerId]
  )

  return result.rows
}

// Create lead
const createLead = async (
  hiringSignalId,
  companyId,
  primaryContactId,
  ownerId,
  stage,
  hiringType,
  fitScore
) => {
  const result = await pool.query(
    `INSERT INTO leads
    (hiring_signal_id, company_id, primary_contact_id, owner_id, stage, hiring_type, fit_score)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`,
    [hiringSignalId, companyId, primaryContactId, ownerId, stage, hiringType, fitScore]
  )

  return result.rows[0]
}

// Update lead stage
const updateLeadStage = async (id, stage) => {
  const result = await pool.query(
    `UPDATE leads
     SET stage = $2,
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, stage]
  )

  return result.rows[0]
}

// Update fit score
const updateFitScore = async (id, fitScore) => {
  const result = await pool.query(
    `UPDATE leads
     SET fit_score = $2,
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, fitScore]
  )

  return result.rows[0]
}

// Delete lead
const deleteLead = async (id) => {
  await pool.query('DELETE FROM leads WHERE id = $1', [id])
}

module.exports = {
  getAllLeads,
  getLeadById,
  getLeadsByCompany,
  getLeadsByOwner,
  createLead,
  updateLeadStage,
  updateFitScore,
  deleteLead
}
