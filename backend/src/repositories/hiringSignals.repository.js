const pool = require('../config/db')

// Get all hiring signals
const getAllHiringSignals = async () => {
  const result = await pool.query(
    'SELECT * FROM hiring_signals ORDER BY detected_at DESC'
  )

  return result.rows
}

// Get hiring signal by id
const getHiringSignalById = async (id) => {
  const result = await pool.query(
    'SELECT * FROM hiring_signals WHERE id = $1',
    [id]
  )

  return result.rows[0]
}

// Create hiring signal
const createHiringSignal = async (
  companyId,
  source,
  sourceUrl,
  roleTitle,
  hiringType,
  rawPayload,
  dedupeKey,
  status
) => {
  const result = await pool.query(
    `INSERT INTO hiring_signals
    (company_id, source, source_url, role_title, hiring_type, raw_payload, dedupe_key, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`,
    [companyId, source, sourceUrl, roleTitle, hiringType, rawPayload, dedupeKey, status]
  )

  return result.rows[0]
}

// Update status
const updateHiringSignalStatus = async (id, status) => {
  const result = await pool.query(
    `UPDATE hiring_signals
     SET status = $2,
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, status]
  )

  return result.rows[0]
}

// Delete hiring signal
const deleteHiringSignal = async (id) => {
  await pool.query('DELETE FROM hiring_signals WHERE id = $1', [id])
}

module.exports = {
  getAllHiringSignals,
  getHiringSignalById,
  createHiringSignal,
  updateHiringSignalStatus,
  deleteHiringSignal
}
