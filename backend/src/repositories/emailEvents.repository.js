const pool = require('../config/db')

// Get all email events
const getAllEmailEvents = async () => {
  const result = await pool.query(
    `SELECT * FROM email_events
     ORDER BY event_time DESC`
  )

  return result.rows
}

// Get one email event by id
const getEmailEventById = async (id) => {
  const result = await pool.query(
    `SELECT * FROM email_events
     WHERE id = $1`,
    [id]
  )

  return result.rows[0]
}

// Get email events for a lead
const getEmailEventsByLead = async (leadId) => {
  const result = await pool.query(
    `SELECT * FROM email_events
     WHERE lead_id = $1
     ORDER BY event_time DESC`,
    [leadId]
  )

  return result.rows
}

// Create email event
const createEmailEvent = async (leadId, eventType, providerMessageId, metadata, eventTime) => {
  const result = await pool.query(
    `INSERT INTO email_events
    (lead_id, event_type, provider_message_id, metadata, event_time)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *`,
    [leadId, eventType, providerMessageId, metadata, eventTime]
  )

  return result.rows[0]
}

// Delete email event
const deleteEmailEvent = async (id) => {
  await pool.query('DELETE FROM email_events WHERE id = $1', [id])
}

module.exports = {
  getAllEmailEvents,
  getEmailEventById,
  getEmailEventsByLead,
  createEmailEvent,
  deleteEmailEvent
}
