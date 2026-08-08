const pool = require('../db/database')

// Get all email events
const getAllEmailEvents = async () => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM email_events
       ORDER BY created_at DESC`
    )

    return result.rows
  } catch (err) {
    console.error('[EMAIL EVENTS REPOSITORY ERROR]', err.message)
    throw err
  }
}

module.exports = {
  getAllEmailEvents
}