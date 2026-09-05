const { success, error } = require('../utils/response')
const { login, refresh, logout } = require('../services/auth.service')
const { updateOwnProfile, getOwnProfile } = require('../repositories/user.repository')

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

async function getProfileHandler(request, reply) {
  try {
    const profile = await getOwnProfile(request.user.id)
    if (!profile) {
      return reply.code(404).send(error('User not found', request.id))
    }
    return reply.code(200).send(success(profile, request.id))
  } catch (err) {
    request.log.error(err)
    return reply.code(500).send(error('Unable to load profile', request.id))
  }
}

// PATCH /auth/me (self-edit own profile)
async function updateProfileHandler(request, reply) {
  try {
    const body = request.body || {}
    const updated = await updateOwnProfile(request.user.id, body)

    if (!updated) {
      return reply.code(404).send(error('User not found', request.id))
    }

    return reply.code(200).send(success(updated, request.id))
  } catch (err) {
    request.log.error(err)
    return reply.code(500).send(error('Unable to update profile', request.id))
  }
}

module.exports = {
  loginHandler,
  refreshHandler,
  logoutHandler,
  getProfileHandler,
  updateProfileHandler
}