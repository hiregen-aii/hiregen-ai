const pool = require('../config/db')

// Get all daily analytics
const getAllAnalyticsDaily = async () => {
  const result = await pool.query(
    `SELECT * FROM analytics_daily
     ORDER BY report_date DESC`
  )

  return result.rows
}

// Get analytics by report date
const getAnalyticsByDate = async (reportDate) => {
  const result = await pool.query(
    `SELECT * FROM analytics_daily
     WHERE report_date = $1`,
    [reportDate]
  )

  return result.rows[0]
}

// Create daily analytics
const createAnalyticsDaily = async (reportDate, totalLeads, emailsSent, meetingsBooked) => {
  const result = await pool.query(
    `INSERT INTO analytics_daily
    (report_date, total_leads, emails_sent, meetings_booked)
    VALUES ($1, $2, $3, $4)
    RETURNING *`,
    [reportDate, totalLeads, emailsSent, meetingsBooked]
  )

  return result.rows[0]
}

// Update daily analytics
const updateAnalyticsDaily = async (reportDate, totalLeads, emailsSent, meetingsBooked) => {
  const result = await pool.query(
    `UPDATE analytics_daily
     SET total_leads = $2,
         emails_sent = $3,
         meetings_booked = $4,
         updated_at = NOW()
     WHERE report_date = $1
     RETURNING *`,
    [reportDate, totalLeads, emailsSent, meetingsBooked]
  )

  return result.rows[0]
}

// Delete daily analytics
const deleteAnalyticsDaily = async (reportDate) => {
  await pool.query('DELETE FROM analytics_daily WHERE report_date = $1', [reportDate])
}

module.exports = {
  getAllAnalyticsDaily,
  getAnalyticsByDate,
  createAnalyticsDaily,
  updateAnalyticsDaily,
  deleteAnalyticsDaily
}
