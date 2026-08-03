{ authLimit } = require('../middleware/rateLimit')
const { loginHandler, refreshHandler, logoutHandler } = require('../controllers/auth.controller')

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
const
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
