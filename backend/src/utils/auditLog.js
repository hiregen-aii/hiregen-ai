// db
const db = require('../config/db')

// log
async function log(actorId, action, entityType, entityId, beforeState = null, afterState = null) {
  const sql = `
    INSERT INTO audit_log (actor_id, action, entity_type, entity_id, before_state, after_state)
    VALUES ($1, $2, $3, $4, $5, $6)
  `
  db.query(sql, [
    actorId,
    action,
    entityType,
    entityId,
    beforeState ? JSON.stringify(beforeState) : null,
    afterState ? JSON.stringify(afterState) : null
  ]).catch(err => console.error('[AUDIT]', err.message))
}

module.exports = { log }
