const pool = require('../config/db')

const saveRefreshToken = async (userId, tokenHash, expiresAt) => {
  const result = await pool.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [userId, tokenHash, expiresAt]
  )

  return result.rows[0]
}

const getRefreshToken = async (tokenHash) => {
  const result = await pool.query(
    `SELECT * FROM refresh_tokens
     WHERE token_hash = $1
       AND revoked = FALSE
       AND expires_at > NOW()`,
    [tokenHash]
  )

  return result.rows[0]
}

const revokeRefreshToken = async (tokenHash) => {
  await pool.query(
    `UPDATE refresh_tokens
     SET revoked = TRUE
     WHERE token_hash = $1`,
    [tokenHash]
  )
}

module.exports = {
  saveRefreshToken,
  getRefreshToken,
  revokeRefreshToken
}
