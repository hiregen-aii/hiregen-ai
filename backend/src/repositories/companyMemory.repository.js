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

// Create company memory
const createCompanyMemory = async (companyId, memory) => {
  const result = await pool.query(
    `INSERT INTO company_memory
    (company_id, memory)
    VALUES ($1, $2)
    RETURNING *`,
    [companyId, memory]
  )

  return result.rows[0]
}

// Update company memory
const updateCompanyMemory = async (id, memory) => {
  const result = await pool.query(
    `UPDATE company_memory
     SET memory = $2,
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, memory]
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
