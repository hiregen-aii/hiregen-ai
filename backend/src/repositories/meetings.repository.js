const pool = require('../config/db')

// Get all meetings
const getAllMeetings = async () => {
  const result = await pool.query(
    `SELECT * FROM meetings
     ORDER BY meeting_time DESC`
  )

  return result.rows
}

// Get meeting by id
const getMeetingById = async (id) => {
  const result = await pool.query(
    `SELECT * FROM meetings
     WHERE id = $1`,
    [id]
  )

  return result.rows[0]
}

// Get meetings by lead
const getMeetingsByLead = async (leadId) => {
  const result = await pool.query(
    `SELECT * FROM meetings
     WHERE lead_id = $1
     ORDER BY meeting_time DESC`,
    [leadId]
  )

  return result.rows
}

// Create meeting
const createMeeting = async (leadId, meetingTime, meetingLink, notes) => {
  const result = await pool.query(
    `INSERT INTO meetings
    (lead_id, meeting_time, meeting_link, notes)
    VALUES ($1, $2, $3, $4)
    RETURNING *`,
    [leadId, meetingTime, meetingLink, notes]
  )

  return result.rows[0]
}

// Update meeting
const updateMeeting = async (id, meetingTime, meetingLink, notes) => {
  const result = await pool.query(
    `UPDATE meetings
     SET meeting_time = $2,
         meeting_link = $3,
         notes = $4,
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, meetingTime, meetingLink, notes]
  )

  return result.rows[0]
}

// Delete meeting
const deleteMeeting = async (id) => {
  await pool.query('DELETE FROM meetings WHERE id = $1', [id])
}

module.exports = {
  getAllMeetings,
  getMeetingById,
  getMeetingsByLead,
  createMeeting,
  updateMeeting,
  deleteMeeting
}
