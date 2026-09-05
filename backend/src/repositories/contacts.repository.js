const pool = require('../config/db')

// Get all contacts
const getAllContacts = async () => {
  const result = await pool.query(
    'SELECT * FROM contacts ORDER BY created_at DESC'
  )

  return result.rows
}

// Get contact by id
const getContactById = async (id) => {
  const result = await pool.query('SELECT * FROM contacts WHERE id = $1', [id])
  return result.rows[0]
}

// Get contacts by company
const getContactsByCompany = async (companyId) => {
  const result = await pool.query(
    'SELECT * FROM contacts WHERE company_id = $1 ORDER BY created_at DESC',
    [companyId]
  )

  return result.rows
}

// Create contact
const createContact = async (companyId, fullName, title, email, linkedinUrl, verified) => {
  const result = await pool.query(
    `INSERT INTO contacts
    (company_id, full_name, title, email, linkedin_url, verified)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *`,
    [companyId, fullName, title, email, linkedinUrl, verified]
  )

  return result.rows[0]
}

// Delete contact
const deleteContact = async (id) => {
  await pool.query('DELETE FROM contacts WHERE id = $1', [id])
}

module.exports = {
  getAllContacts,
  getContactById,
  getContactsByCompany,
  createContact,
  deleteContact
}
