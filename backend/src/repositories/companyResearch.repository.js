const pool = require('../config/db')

// Get all company research records
const getAllResearch = async () => {
  const result = await pool.query(
    `SELECT * FROM company_research
     ORDER BY created_at DESC`
  )

  return result.rows
}

// Get research by id
const getResearchById = async (id) => {
  const result = await pool.query(
    `SELECT * FROM company_research
     WHERE id = $1`,
    [id]
  )

  return result.rows[0]
}

// Get research by company
const getResearchByCompany = async (companyId) => {
  const result = await pool.query(
    `SELECT * FROM company_research
     WHERE company_id = $1
     ORDER BY created_at DESC`,
    [companyId]
  )

  return result.rows
}

// Create research
const createResearch = async (companyId, summary, sourceUrls, modelUsed, completedAt) => {
  const result = await pool.query(
    `INSERT INTO company_research
    (company_id, summary, source_urls, model_used, completed_at)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *`,
    [companyId, summary, sourceUrls, modelUsed, completedAt]
  )

  return result.rows[0]
}

// FIX: race condition flagged in research.agent.js — two concurrent
// research calls for the same company could both see "no existing row"
// and both INSERT, since the old read-then-write pattern wasn't atomic.
// This uses the company_research_company_id_key UNIQUE constraint
// (migration 003) with ON CONFLICT so the DB itself resolves the race:
// whichever write lands second updates the same row instead of creating
// a duplicate. Prefer this over createResearch/updateResearch for new code.
const upsertResearch = async (companyId, summary, sourceUrls, modelUsed, completedAt) => {
  const result = await pool.query(
    `INSERT INTO company_research
    (company_id, summary, source_urls, model_used, completed_at)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (company_id) DO UPDATE
    SET summary = EXCLUDED.summary,
        source_urls = EXCLUDED.source_urls,
        model_used = EXCLUDED.model_used,
        completed_at = EXCLUDED.completed_at,
        updated_at = NOW()
    RETURNING *`,
    [companyId, summary, sourceUrls, modelUsed, completedAt]
  )

  return result.rows[0]
}

// Update research
const updateResearch = async (id, summary, sourceUrls, modelUsed, completedAt) => {
  const result = await pool.query(
    `UPDATE company_research
     SET summary = $2,
         source_urls = $3,
         model_used = $4,
         completed_at = $5,
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, summary, sourceUrls, modelUsed, completedAt]
  )

  return result.rows[0]
}

// Delete research
const deleteResearch = async (id) => {
  await pool.query('DELETE FROM company_research WHERE id = $1', [id])
}

module.exports = {
  getAllResearch,
  getResearchById,
  getResearchByCompany,
  createResearch,
  upsertResearch,
  updateResearch,
  deleteResearch
}
