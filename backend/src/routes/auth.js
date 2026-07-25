const { authLimit } = require('../middleware/rateLimit')
const { loginHandler, refreshHandler, logoutHandler } = require('../controllers/authController')

module.exports = async function authRoutes(fastify) {
  fastify.post(
    '/api/auth/login',
    {
      config: {
        rateLimit: authLimit
      }
    },
    loginHandler
  )

  fastify.post(
    '/api/auth/refresh',
    {
      config: {
        rateLimit: authLimit
      }
    },
    refreshHandler
  )

  fastify.post(
    '/api/auth/logout',
    {
      config: {
        rateLimit: authLimit
      }
    },
    logoutHandler
  )
}
