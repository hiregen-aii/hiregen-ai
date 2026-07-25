const pool = require('../config/db')

// Get all campaigns
const getAllCampaigns = async () => {
  const result = await pool.query(
    `SELECT * FROM campaigns
     ORDER BY created_at DESC`
  )

  return result.rows
}

// Get campaign by id
const getCampaignById = async (id) => {
  const result = await pool.query(
    `SELECT * FROM campaigns
     WHERE id = $1`,
    [id]
  )

  return result.rows[0]
}

// Create campaign
const createCampaign = async (name, hiringType, templateReference, isActive, status) => {
  const result = await pool.query(
    `INSERT INTO campaigns
    (name, hiring_type, template_reference, is_active, status)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *`,
    [name, hiringType, templateReference, isActive, status]
  )

  return result.rows[0]
}

// Update campaign
const updateCampaign = async (id, name, hiringType, templateReference, isActive, status) => {
  const result = await pool.query(
    `UPDATE campaigns
     SET
       name = $2,
       hiring_type = $3,
       template_reference = $4,
       is_active = $5,
       status = $6,
       updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, name, hiringType, templateReference, isActive, status]
  )

  return result.rows[0]
}

// Delete campaign
const deleteCampaign = async (id) => {
  await pool.query('DELETE FROM campaigns WHERE id = $1', [id])
}

module.exports = {
  getAllCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign
}
