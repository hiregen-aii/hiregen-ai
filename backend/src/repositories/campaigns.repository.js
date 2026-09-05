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
       name = COALESCE($2, name),
       hiring_type = COALESCE($3::hiring_type, hiring_type),
       template_reference = COALESCE($4, template_reference),
       is_active = COALESCE($5, is_active),
       status = COALESCE($6::campaign_status, status),
       updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [
      id,
      name ?? null,
      hiringType ?? null,
      templateReference ?? null,
      isActive ?? null,
      status ?? null,
    ]
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
