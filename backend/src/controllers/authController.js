const { success, error } = require('../utils/response')
const { login, refresh, logout } = require('../services/authService')

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

module.exports = { loginHandler, refreshHandler, logoutHandler }
