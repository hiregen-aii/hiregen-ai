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

// NEW — for GET /admin/users (Administration page). Excludes password_hash.
const getAllUsers = async () => {
  const result = await pool.query(
    `SELECT id, email, full_name, role, is_active, created_at
     FROM users
     ORDER BY created_at DESC`
  )

  return result.rows
}

// NEW — for PATCH /admin/users/:id/role
const updateUserRole = async (id, role) => {
  const result = await pool.query(
    `UPDATE users
     SET role = $2, updated_at = NOW()
     WHERE id = $1
     RETURNING id, email, full_name, role, is_active`,
    [id, role]
  )

  return result.rows[0]
}

// NEW — for PATCH /admin/users/:id/status (activate/deactivate)
const updateUserStatus = async (id, isActive) => {
  const result = await pool.query(
    `UPDATE users
     SET is_active = $2, updated_at = NOW()
     WHERE id = $1
     RETURNING id, email, full_name, role, is_active`,
    [id, isActive]
  )

  return result.rows[0]
}

// NEW — for PATCH /auth/me (self-edit own profile, name only —
// email intentionally excluded here since changing it affects login
// and would need re-verification; add later if genuinely needed).
const updateOwnProfile = async (id, fullName) => {
  const result = await pool.query(
    `UPDATE users
     SET full_name = $2, updated_at = NOW()
     WHERE id = $1
     RETURNING id, email, full_name, role`,
    [id, fullName]
  )

  return result.rows[0]
}

module.exports = {
  findById,
  findByEmail,
  createUser,
  upsertAdminUser,
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  updateOwnProfile
}