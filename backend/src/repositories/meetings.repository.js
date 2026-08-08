const pool = require('../db/database')

// Get all meetings
const getAllMeetings = async () => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM meetings
       ORDER BY created_at DESC`
    )

    return result.rows
  } catch (err) {
    console.error('[MEETINGS REPOSITORY ERROR]', err.message)
    throw err
  }
}

module.exports = {
  getAllMeetings
}