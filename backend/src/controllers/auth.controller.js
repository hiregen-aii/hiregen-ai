const { success, error } = require('../utils/response')
const { login, refresh, logout } = require('../services/auth.service')
const { updateOwnProfile } = require('../repositories/user.repository')

async function loginHandler(request, reply) {
  try {
    const { email, password } = request.body || {}
    const result = await login(email, password)

    return reply.code(200).send(success(result, request.id))
  } catch (err) {
    const statusCode = err.statusCode || 500
    const message = err.message || 'Login failed'

    return reply.code(statusCode).send(error(message, request.id))
  }
}

async function refreshHandler(request, reply) {
  try {
    const { refreshToken } = request.body || {}
    const result = await refresh(refreshToken)

    return reply.code(200).send(success(result, request.id))
  } catch (err) {
    const statusCode = err.statusCode || 500
    const message = err.message || 'Refresh failed'

    return reply.code(statusCode).send(error(message, request.id))
  }
}

async function logoutHandler(request, reply) {
  try {
    const { refreshToken } = request.body || {}
    const result = await logout(refreshToken)

    return reply.code(200).send(success(result, request.id))
  } catch (err) {
    const statusCode = err.statusCode || 500
    const message = err.message || 'Logout failed'

    return reply.code(statusCode).send(error(message, request.id))
  }
}

// NEW — PATCH /auth/me. Only updates your OWN profile (id comes from the
// verified JWT, never from the request body/params) — no way to edit
// someone else's account through this route.
async function updateProfileHandler(request, reply) {
  try {
    const { fullName } = request.body || {}

    if (!fullName || typeof fullName !== 'string' || fullName.trim().length === 0) {
      return reply.code(400).send(error('fullName is required', request.id))
    }

    const updated = await updateOwnProfile(request.user.id, fullName.trim())

    return reply.code(200).send(success(updated, request.id))
  } catch (err) {
    return reply.code(500).send(error('Unable to update profile', request.id))
  }
}

module.exports = { loginHandler, refreshHandler, logoutHandler, updateProfileHandler }