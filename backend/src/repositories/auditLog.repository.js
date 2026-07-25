const pool = require('../config/db')

// Get all audit logs
const getAllAuditLogs = async () => {
  const result = await pool.query(
    `SELECT * FROM audit_log
     ORDER BY created_at DESC`
  )

  return result.rows
}

// Get audit log by id
const getAuditLogById = async (id) => {
  const result = await pool.query(
    `SELECT * FROM audit_log
     WHERE id = $1`,
    [id]
  )

  return result.rows[0]
}

// Get audit logs by user
const getAuditLogsByUser = async (userId) => {
  const result = await pool.query(
    `SELECT * FROM audit_log
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  )

  return result.rows
}

// Create audit log
const createAuditLog = async (userId, action, entityName, entityId, beforeSnapshot, afterSnapshot) => {
  const result = await pool.query(
    `INSERT INTO audit_log
    (user_id, action, entity_name, entity_id, before_snapshot, after_snapshot)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *`,
    [userId, action, entityName, entityId, beforeSnapshot, afterSnapshot]
  )

  return result.rows[0]
}

// Delete audit log
const deleteAuditLog = async (id) => {
  await pool.query('DELETE FROM audit_log WHERE id = $1', [id])
}

module.exports = {
  getAllAuditLogs,
  getAuditLogById,
  getAuditLogsByUser,
  createAuditLog,
  deleteAuditLog
}
