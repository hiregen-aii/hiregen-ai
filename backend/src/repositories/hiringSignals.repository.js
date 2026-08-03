const pool = require('../config/db')

// get hiring signals with conditions
const getHiringSignals = async ({
  status,
  source,
  page = 1,
  limit = 10,
}) => {
  const values = [];
  const conditions = [];

  let query = `
    SELECT hs.*, c.name AS company_name
    FROM hiring_signals hs
    JOIN companies c
      ON hs.company_id = c.id
  `;

  if (status) {
    values.push(status);
    conditions.push(`hs.status = $${values.length}`);
  }

  if (source) {
    values.push(source);
    conditions.push(`hs.source = $${values.length}`);
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }

  values.push(limit);
  values.push((page - 1) * limit);

  query += `
    ORDER BY hs.created_at DESC
    LIMIT $${values.length - 1}
    OFFSET $${values.length}
  `;

  const result = await pool.query(query, values);

  return result.rows;
};

// Get hiring signal details
const getHiringSignalDetails = async (id) => {

  const result = await pool.query(
    `
    SELECT
      hs.*,
      c.name AS company_name,
      c.domain,
      c.industry,
      c.size_range,
      c.linkedin_url

    FROM hiring_signals hs

    JOIN companies c
      ON hs.company_id = c.id

    WHERE hs.id = $1
    `,
    [id]
  );

  return result.rows[0];

};

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

// get hiring signal by dedupekey
const getHiringSignalByDedupeKey = async (dedupeKey) => {
    const result = await pool.query(
        `SELECT *
         FROM hiring_signals
         WHERE dedupe_key = $1`,
        [dedupeKey]
    );

    return result.rows[0];
};

module.exports = {
  getHiringSignals,
  getAllHiringSignals,
  getHiringSignalById,
  createHiringSignal,
  updateHiringSignalStatus,
  deleteHiringSignal,
  getHiringSignalByDedupeKey,
  updateHiringSignalStatus
}
