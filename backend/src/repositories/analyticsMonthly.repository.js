const pool = require('../config/db')

// Get all monthly analytics
const getAllAnalyticsMonthly = async () => {
  const result = await pool.query(
    `SELECT * FROM analytics_monthly
     ORDER BY report_month DESC`
  )

  return result.rows
}

// Get monthly analytics
const getAnalyticsMonthly = async (reportMonth) => {
  const result = await pool.query(
    `SELECT * FROM analytics_monthly
     WHERE report_month = $1`,
    [reportMonth]
  )

  return result.rows[0]
}

// Create monthly analytics
const createAnalyticsMonthly = async (reportMonth, totalLeads, emailsSent, meetingsBooked) => {
  const result = await pool.query(
    `INSERT INTO analytics_monthly
    (report_month, total_leads, emails_sent, meetings_booked)
    VALUES ($1, $2, $3, $4)
    RETURNING *`,
    [reportMonth, totalLeads, emailsSent, meetingsBooked]
  )

  return result.rows[0]
}

// Update monthly analytics
const updateAnalyticsMonthly = async (reportMonth, totalLeads, emailsSent, meetingsBooked) => {
  const result = await pool.query(
    `UPDATE analytics_monthly
     SET total_leads = $2,
         emails_sent = $3,
         meetings_booked = $4,
         updated_at = NOW()
     WHERE report_month = $1
     RETURNING *`,
    [reportMonth, totalLeads, emailsSent, meetingsBooked]
  )

  return result.rows[0]
}

// Delete monthly analytics
const deleteAnalyticsMonthly = async (reportMonth) => {
  await pool.query('DELETE FROM analytics_monthly WHERE report_month = $1', [reportMonth])
}

module.exports = {
  getAllAnalyticsMonthly,
  getAnalyticsMonthly,
  createAnalyticsMonthly,
  updateAnalyticsMonthly,
  deleteAnalyticsMonthly
}
