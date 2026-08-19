const pool = require('../config/db')

// Get all company memory records
const getAllCompanyMemory = async () => {
  const result = await pool.query(
    `SELECT * FROM company_memory
     ORDER BY created_at DESC`
  )

  return result.rows
}

// Get company memory by id
const getCompanyMemoryById = async (id) => {
  const result = await pool.query(
    `SELECT * FROM company_memory
     WHERE id = $1`,
    [id]
  )

  return result.rows[0]
}

// Get company memory by company
const getCompanyMemoryByCompany = async (companyId) => {
  const result = await pool.query(
    `SELECT * FROM company_memory
     WHERE company_id = $1
     ORDER BY created_at DESC`,
    [companyId]
  )

  return result.rows
}

// Create company memory.
// `memory` is expected to be a plain JS object (e.g.
// { lastResearchSummary, lastResearchAt, hiringPattern, sentimentHistory }).
// A bare string is still accepted for backwards compatibility and wrapped
// as { summary: memory } so old caller code doesn't hard-crash — but new
// code should pass a structured object.
const createCompanyMemory = async (companyId, memory) => {
  const memoryObj = typeof memory === 'string' ? { summary: memory } : (memory || {})

  const result = await pool.query(
    `INSERT INTO company_memory
    (company_id, memory)
    VALUES ($1, $2::jsonb)
    RETURNING *`,
    [companyId, JSON.stringify(memoryObj)]
  )

  return result.rows[0]
}

// Update company memory.
// FIX: this used to overwrite the entire memory blob on every call, which
// meant the last agent to write always erased whatever a different agent
// (e.g. Follow-Up Agent writing sentiment, Research Agent writing a
// summary) had stored earlier. It now MERGES the given patch object into
// the existing JSONB via Postgres's `||` operator, so each agent can
// update only the keys it owns without clobbering the rest.
const updateCompanyMemory = async (id, memoryPatch) => {
  const patchObj = typeof memoryPatch === 'string' ? { summary: memoryPatch } : (memoryPatch || {})

  const result = await pool.query(
    `UPDATE company_memory
     SET memory = memory || $2::jsonb,
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, JSON.stringify(patchObj)]
  )

  return result.rows[0]
}

// Delete company memory
const deleteCompanyMemory = async (id) => {
  await pool.query('DELETE FROM company_memory WHERE id = $1', [id])
}

module.exports = {
  getAllCompanyMemory,
  getCompanyMemoryById,
  getCompanyMemoryByCompany,
  createCompanyMemory,
  updateCompanyMemory,
  deleteCompanyMemory
}
