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
           designation = COALESCE(users.designation, 'Administrator'),
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

// GET /auth/me (get logged in user's full profile)
const getOwnProfile = async (id) => {
  const result = await pool.query(
    `SELECT id, email, full_name, role, is_active, created_at,
            phone, designation, department, employee_id, dob, gender,
            address, city, state, country, manager, joining_date,
            work_location, employment_type, profile_image, skills, activities
     FROM users
     WHERE id = $1`,
    [id]
  )
  return result.rows[0]
}

// PATCH /auth/me (self-edit own profile)
const updateOwnProfile = async (id, data) => {
  const {
    fullName,
    phone,
    designation,
    department,
    employeeId,
    dob,
    gender,
    address,
    city,
    state,
    country,
    manager,
    joiningDate,
    workLocation,
    employmentType,
    profileImage,
    skills,
    activities
  } = data

  const result = await pool.query(
    `UPDATE users
     SET full_name = COALESCE($2, full_name),
         phone = COALESCE($3, phone),
         designation = COALESCE($4, designation),
         department = COALESCE($5, department),
         employee_id = COALESCE($6, employee_id),
         dob = COALESCE($7, dob),
         gender = COALESCE($8, gender),
         address = COALESCE($9, address),
         city = COALESCE($10, city),
         state = COALESCE($11, state),
         country = COALESCE($12, country),
         manager = COALESCE($13, manager),
         joining_date = COALESCE($14, joining_date),
         work_location = COALESCE($15, work_location),
         employment_type = COALESCE($16, employment_type),
         profile_image = COALESCE($17, profile_image),
         skills = COALESCE($18, skills),
         activities = COALESCE($19, activities),
         updated_at = NOW()
     WHERE id = $1
     RETURNING id, email, full_name, role, is_active, created_at,
               phone, designation, department, employee_id, dob, gender,
               address, city, state, country, manager, joining_date,
               work_location, employment_type, profile_image, skills, activities`,
    [
      id,
      fullName !== undefined ? fullName : null,
      phone !== undefined ? phone : null,
      designation !== undefined ? designation : null,
      department !== undefined ? department : null,
      employeeId !== undefined ? employeeId : null,
      dob !== undefined ? dob : null,
      gender !== undefined ? gender : null,
      address !== undefined ? address : null,
      city !== undefined ? city : null,
      state !== undefined ? state : null,
      country !== undefined ? country : null,
      manager !== undefined ? manager : null,
      joiningDate !== undefined ? joiningDate : null,
      workLocation !== undefined ? workLocation : null,
      employmentType !== undefined ? employmentType : null,
      profileImage !== undefined ? profileImage : null,
      skills !== undefined ? JSON.stringify(skills) : null,
      activities !== undefined ? JSON.stringify(activities) : null
    ]
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
  getOwnProfile,
  updateOwnProfile
}