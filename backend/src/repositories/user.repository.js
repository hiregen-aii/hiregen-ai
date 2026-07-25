const pool = require('../config/db')

const findById = async (id) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE id = $1',
    [id]
  )

  return result.rows[0]
}

const findByEmail = async (email) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  )

  return result.rows[0]
}

const createUser = async (email, passwordHash, fullName, role) => {
  const result = await pool.query(
    `INSERT INTO users
    (email, password_hash, full_name, role)
    VALUES ($1, $2, $3, $4)
    RETURNING *`,
    [email, passwordHash, fullName, role]
  )

  return result.rows[0]
}

const upsertAdminUser = async (email, passwordHash, fullName, role) => {
  const existing = await findByEmail(email)

  if (existing) {
    const result = await pool.query(
      `UPDATE users
       SET password_hash = $2,
           full_name = $3,
           role = $4,
           updated_at = NOW()
       WHERE email = $1
       RETURNING *`,
      [email, passwordHash, fullName, role]
    )

    return result.rows[0]
  }

  return createUser(email, passwordHash, fullName, role)
}

module.exports = {
  findById,
  findByEmail,
  createUser,
  upsertAdminUser
}
