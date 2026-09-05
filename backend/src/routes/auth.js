const { authLimit } = require('../middleware/rateLimit')
const { verifyToken } = require('../middleware/authenticate')
const {
  loginHandler,
  refreshHandler,
  logoutHandler,
  getProfileHandler,
  updateProfileHandler
} = require('../controllers/auth.controller')

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

  // Get logged-in user profile from PostgreSQL
  fastify.get(
    '/me',
    {
      preHandler: [verifyToken]
    },
    getProfileHandler
  )

  // Update logged-in user profile in PostgreSQL
  fastify.patch(
    '/me',
    {
      preHandler: [verifyToken]
    },
    updateProfileHandler
  )
}