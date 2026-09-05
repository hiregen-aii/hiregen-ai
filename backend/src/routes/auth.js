const { authLimit } = require('../middleware/rateLimit')
const { verifyToken } = require('../middleware/authenticate')
const {
  loginHandler,
  refreshHandler,
  logoutHandler,
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

  // NEW — self-service profile edit (name only). Requires a valid session;
  // no role restriction beyond "you must be logged in as yourself".
  fastify.patch(
    '/me',
    {
      preHandler: [verifyToken]
    },
    updateProfileHandler
  )
}