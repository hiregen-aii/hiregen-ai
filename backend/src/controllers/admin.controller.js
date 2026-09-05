const { success, error } = require('../utils/response')
const {
  getAllUsers,
  updateUserRole,
  updateUserStatus
} = require('../repositories/user.repository')

async function adminProfileHandler(request, reply) {
  try {
    return reply.code(200).send(success({
      message: 'Admin access confirmed',
      user: request.user
    }, request.id))
  } catch (err) {
    return reply.code(500).send(error('Unable to load admin profile', request.id))
  }
}

// NEW — GET /admin/users
async function listUsersHandler(request, reply) {
  try {
    const users = await getAllUsers()
    return reply.code(200).send(success(users, request.id))
  } catch (err) {
    return reply.code(500).send(error('Unable to load users', request.id))
  }
}

// NEW — PATCH /admin/users/:id/role
const VALID_ROLES = ['ADMIN', 'MANAGER', 'SALES_REP', 'RECRUITER', 'VIEWER']

async function updateUserRoleHandler(request, reply) {
  try {
    const { id } = request.params
    const { role } = request.body || {}

    if (!VALID_ROLES.includes(role)) {
      return reply.code(400).send(error(`role must be one of: ${VALID_ROLES.join(', ')}`, request.id))
    }

    const updated = await updateUserRole(id, role)

    if (!updated) {
      return reply.code(404).send(error('User not found', request.id))
    }

    return reply.code(200).send(success(updated, request.id))
  } catch (err) {
    return reply.code(500).send(error('Unable to update user role', request.id))
  }
}

// NEW — PATCH /admin/users/:id/status
async function updateUserStatusHandler(request, reply) {
  try {
    const { id } = request.params
    const { isActive } = request.body || {}

    if (typeof isActive !== 'boolean') {
      return reply.code(400).send(error('isActive must be a boolean', request.id))
    }

    const updated = await updateUserStatus(id, isActive)

    if (!updated) {
      return reply.code(404).send(error('User not found', request.id))
    }

    return reply.code(200).send(success(updated, request.id))
  } catch (err) {
    return reply.code(500).send(error('Unable to update user status', request.id))
  }
}

module.exports = {
  adminProfileHandler,
  listUsersHandler,
  updateUserRoleHandler,
  updateUserStatusHandler
}