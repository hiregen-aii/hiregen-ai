const pool = require('../config/db')

// Used internally by other controllers (approval, leads, campaigns) after
// an action that should notify a user — never called directly by a route.
const createNotification = async (userId, type, title, message, relatedEntityType, relatedEntityId) => {
  const result = await pool.query(
    `INSERT INTO notifications
     (user_id, type, title, message, related_entity_type, related_entity_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [userId, type, title, message, relatedEntityType || null, relatedEntityId || null]
  )

  return result.rows[0]
}

const getNotificationsForUser = async (userId, unreadOnly, limit) => {
  const whereClause = unreadOnly ? 'AND is_read = false' : ''

  const result = await pool.query(
    `SELECT * FROM notifications
     WHERE user_id = $1 ${whereClause}
     ORDER BY created_at DESC
     LIMIT $2`,
    [userId, limit]
  )

  return result.rows
}

const markNotificationRead = async (id, userId) => {
  // userId in the WHERE clause too — a user can only mark their OWN
  // notifications as read, never someone else's by guessing an id.
  const result = await pool.query(
    `UPDATE notifications
     SET is_read = true
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [id, userId]
  )

  return result.rows[0]
}

const markAllNotificationsRead = async (userId) => {
  const result = await pool.query(
    `UPDATE notifications
     SET is_read = true
     WHERE user_id = $1 AND is_read = false
     RETURNING id`,
    [userId]
  )

  return result.rowCount
}

module.exports = {
  createNotification,
  getNotificationsForUser,
  markNotificationRead,
  markAllNotificationsRead
}