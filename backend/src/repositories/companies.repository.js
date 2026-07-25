const pool = require('../config/db')

// Get all companies
const getAllCompanies = async () => {
  const result = await pool.query(
    'SELECT * FROM companies ORDER BY created_at DESC'
  )

  return result.rows
}

// Get one company by id
const getCompanyById = async (id) => {
  const result = await pool.query(
    'SELECT * FROM companies WHERE id = $1',
    [id]
  )

  return result.rows[0]
}

// Create company
const createCompany = async (name, domain, industry, sizeRange, linkedinUrl) => {
  const result = await pool.query(
    `INSERT INTO companies
    (name, domain, industry, size_range, linkedin_url)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *`,
    [name, domain, industry, sizeRange, linkedinUrl]
  )

  return result.rows[0]
}

// Update company
const updateCompany = async (id, name, domain, industry, sizeRange, linkedinUrl) => {
  const result = await pool.query(
    `UPDATE companies
     SET
       name = $2,
       domain = $3,
       industry = $4,
       size_range = $5,
       linkedin_url = $6,
       updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, name, domain, industry, sizeRange, linkedinUrl]
  )

  return result.rows[0]
}

// Delete company
const deleteCompany = async (id) => {
  await pool.query('DELETE FROM companies WHERE id = $1', [id])
}

module.exports = {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany
}
