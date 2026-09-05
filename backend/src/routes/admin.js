const { verifyToken } = require('../middleware/authenticate')
const { requireRole } = require('../middleware/authorize')
const {
  adminProfileHandler,
  listUsersHandler,
  updateUserRoleHandler,
  updateUserStatusHandler
} = require('../controllers/admin.controller')

module.exports = async function adminRoutes(fastify) {
  fastify.get(
    '/profile',
    {
      preHandler: [verifyToken, requireRole(['ADMIN', 'MANAGER'])]
    },
    adminProfileHandler
  )

  // NEW — Administration page: list all users
  fastify.get(
    '/users',
    {
      preHandler: [verifyToken, requireRole(['ADMIN'])]
    },
    listUsersHandler
  )

  // NEW — Administration page: change a user's role
  fastify.patch(
    '/users/:id/role',
    {
      preHandler: [verifyToken, requireRole(['ADMIN'])]
    },
    updateUserRoleHandler
  )

  // NEW — Administration page: activate/deactivate a user
  fastify.patch(
    '/users/:id/status',
    {
      preHandler: [verifyToken, requireRole(['ADMIN'])]
    },
    updateUserStatusHandler
  )
}