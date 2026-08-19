const pool = require('../config/db')
const AppError = require('../utils/AppError')

// Valid enum values (must match migrations/001_create_core_schema.sql)
const LEAD_STAGES = [
  'NEW',
  'RESEARCHED',
  'OUTREACH_DRAFTED',
  'APPROVED',
  'SENT',
  'REPLIED',
  'MEETING_BOOKED',
  'WON',
  'LOST'
]

const HIRING_TYPES = ['INTERN', 'FULL_TIME', 'CONTRACT', 'BULK_HIRING', 'CAMPUS_DRIVE']

// Wrap raw pg/driver errors so callers always get a consistent AppError
const wrapDbError = (err, fallbackMessage) => {
  if (err instanceof AppError) return err

  // Postgres unique_violation
  if (err.code === '23505') {
    return new AppError('A lead with this hiring signal already exists', 409)
  }

  // Postgres foreign_key_violation
  if (err.code === '23503') {
    return new AppError('Referenced company, contact, or owner does not exist', 400)
  }

  // Postgres check_violation (e.g. fit_score out of range)
  if (err.code === '23514') {
    return new AppError('Lead data failed a database constraint check', 400)
  }

  // Invalid UUID passed as an id
  if (err.code === '22P02') {
    return new AppError('Invalid id format', 400)
  }

  console.error('[LEADS REPOSITORY ERROR]', err.message)
  return new AppError(fallbackMessage, 500)
}

// Get all leads
const getAllLeads = async () => {
  try {
    const result = await pool.query(
      `SELECT * FROM leads
       ORDER BY created_at DESC`
    )

    return result.rows
  } catch (err) {
    throw wrapDbError(err, 'Failed to fetch leads')
  }
}

// Get lead by id
const getLeadById = async (id) => {
  if (!id) {
    throw new AppError('Lead id is required', 400)
  }

  try {
    const result = await pool.query(
      `SELECT * FROM leads
       WHERE id = $1`,
      [id]
    )

    return result.rows[0] || null
  } catch (err) {
    throw wrapDbError(err, 'Failed to fetch lead')
  }
}
// Get lead by hiring signal
const getLeadByHiringSignal = async (hiringSignalId) => {
  if (!hiringSignalId) {
    throw new AppError('Hiring signal id is required', 400)
  }

  try {
    const result = await pool.query(
      `SELECT * FROM leads
       WHERE hiring_signal_id = $1`,
      [hiringSignalId]
    )

    return result.rows[0] || null
  } catch (err) {
    throw wrapDbError(err, 'Failed to fetch lead by hiring signal')
  }
}
// Get leads by company
const getLeadsByCompany = async (companyId) => {
  if (!companyId) {
    throw new AppError('Company id is required', 400)
  }

  try {
    const result = await pool.query(
      `SELECT * FROM leads
       WHERE company_id = $1
       ORDER BY created_at DESC`,
      [companyId]
    )

    return result.rows
  } catch (err) {
    throw wrapDbError(err, 'Failed to fetch leads for company')
  }
}

// Get leads by owner
const getLeadsByOwner = async (ownerId) => {
  if (!ownerId) {
    throw new AppError('Owner id is required', 400)
  }

  try {
    const result = await pool.query(
      `SELECT * FROM leads
       WHERE owner_id = $1
       ORDER BY created_at DESC`,
      [ownerId]
    )

    return result.rows
  } catch (err) {
    throw wrapDbError(err, 'Failed to fetch leads for owner')
  }
}

// Create lead
const createLead = async (
  hiringSignalId,
  companyId,
  primaryContactId,
  ownerId,
  stage = 'NEW',
  hiringType,
  fitScore = 0
) => {
  if (!hiringSignalId) {
    throw new AppError('hiringSignalId is required', 400)
  }

  if (!companyId) {
    throw new AppError('companyId is required', 400)
  }

  if (stage && !LEAD_STAGES.includes(stage)) {
    throw new AppError(`Invalid stage. Must be one of: ${LEAD_STAGES.join(', ')}`, 400)
  }

  if (hiringType && !HIRING_TYPES.includes(hiringType)) {
    throw new AppError(`Invalid hiringType. Must be one of: ${HIRING_TYPES.join(', ')}`, 400)
  }

  if (fitScore !== null && fitScore !== undefined && (fitScore < 0 || fitScore > 100)) {
    throw new AppError('fitScore must be between 0 and 100', 400)
  }

  try {
    const result = await pool.query(
      `INSERT INTO leads
      (hiring_signal_id, company_id, primary_contact_id, owner_id, stage, hiring_type, fit_score)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [hiringSignalId, companyId, primaryContactId, ownerId, stage, hiringType, fitScore]
    )

    return result.rows[0]
  } catch (err) {
    throw wrapDbError(err, 'Failed to create lead')
  }
}

// Update lead stage
const updateLeadStage = async (id, stage) => {
  if (!id) {
    throw new AppError('Lead id is required', 400)
  }

  if (!LEAD_STAGES.includes(stage)) {
    throw new AppError(`Invalid stage. Must be one of: ${LEAD_STAGES.join(', ')}`, 400)
  }

  try {
    const result = await pool.query(
      `UPDATE leads
       SET stage = $2,
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, stage]
    )

    if (!result.rows[0]) {
      throw new AppError('Lead not found', 404)
    }

    return result.rows[0]
  } catch (err) {
    throw wrapDbError(err, 'Failed to update lead stage')
  }
}

// Update lead owner (Optional)
const updateLeadOwner = async (id, ownerId) => {
  if (!id) {
    throw new AppError('Lead id is required', 400)
  }

  try {
    const result = await pool.query(
      `UPDATE leads
       SET owner_id = $2,
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, ownerId]
    )

    if (!result.rows[0]) {
      throw new AppError('Lead not found', 404)
    }

    return result.rows[0]
  } catch (err) {
    throw wrapDbError(err, 'Failed to update lead owner')
  }
}

// Update lead score / fit score (Optional)
const updateLeadScore = async (id, fitScore) => {
  if (!id) {
    throw new AppError('Lead id is required', 400)
  }

  if (fitScore === null || fitScore === undefined || fitScore < 0 || fitScore > 100) {
    throw new AppError('fitScore must be between 0 and 100', 400)
  }

  try {
    const result = await pool.query(
      `UPDATE leads
       SET fit_score = $2,
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, fitScore]
    )

    if (!result.rows[0]) {
      throw new AppError('Lead not found', 404)
    }

    return result.rows[0]
  } catch (err) {
    throw wrapDbError(err, 'Failed to update lead score')
  }
}

// Update lead urgency
const updateLeadUrgency = async (id, urgency) => {
  if (!id) {
    throw new AppError('Lead id is required', 400)
  }

  const allowedUrgency = ['LOW', 'MEDIUM', 'HIGH']

  if (!allowedUrgency.includes(urgency)) {
    throw new AppError('Urgency must be LOW, MEDIUM or HIGH', 400)
  }

  try {
    const result = await pool.query(
      `UPDATE leads
       SET urgency = $2,
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, urgency]
    )

    if (!result.rows[0]) {
      throw new AppError('Lead not found', 404)
    }

    return result.rows[0]
  } catch (err) {
    throw wrapDbError(err, 'Failed to update lead urgency')
  }
}
// Kept for backwards compatibility with existing callers
const updateFitScore = updateLeadScore

// Delete lead
const deleteLead = async (id) => {
  if (!id) {
    throw new AppError('Lead id is required', 400)
  }

  try {
    const result = await pool.query('DELETE FROM leads WHERE id = $1', [id])

    if (result.rowCount === 0) {
      throw new AppError('Lead not found', 404)
    }
  } catch (err) {
    throw wrapDbError(err, 'Failed to delete lead')
  }
}

module.exports = {
  LEAD_STAGES,
  HIRING_TYPES,
  getAllLeads,
  getLeadById,
  getLeadByHiringSignal,
  getLeadsByCompany,
  getLeadsByOwner,
  createLead,
  updateLeadStage,
  updateLeadOwner,
  updateLeadScore,
  updateFitScore,
  updateLeadUrgency,
  deleteLead
}