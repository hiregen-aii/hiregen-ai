const { authLimit } = require('../middleware/rateLimit')
const { loginHandler, refreshHandler, logoutHandler } = require('../controllers/auth.controller')

// FIX: paths were hardcoded as /api/auth/... (no /v1), inconsistent with
// the rest of the API (SRS §14 specifies /api/v1/...). Now registered
// with relative paths + a /api/v1/auth prefix from server.js.
module.exports = async function authRoutes(fastify) {
  fastify.post(
    '/login',
    {
      config: {
        rateLimit: authLimit
      }
    },
    loginHandler
  )

  fastify.post(
    '/refresh',
    {
      config: {
        rateLimit: authLimit
      }
    },
    refreshHandler
  )

  fastify.post(
    '/logout',
    {
      config: {
        rateLimit: authLimit
      }
    },
    logoutHandler
  )
}
