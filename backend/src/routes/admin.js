const { verifyToken } = require('../middleware/authenticate')
const { requireRole } = require('../middleware/authorize')
const { adminProfileHandler } = require('../controllers/adminController')

module.exports = async function adminRoutes(fastify) {
  fastify.get(
    '/api/admin/profile',
    {
      preHandler: [verifyToken, requireRole(['ADMIN', 'MANAGER'])]
    },
    adminProfileHandler
  )
}
