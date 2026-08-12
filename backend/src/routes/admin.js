const { verifyToken } = require('../middleware/authenticate')
const { requireRole } = require('../middleware/authorize')
const { adminProfileHandler } = require('../controllers/admin.controller')

// FIX: was hardcoded /api/admin/profile — now relative path + prefix from
// server.js, consistent with /api/v1/... everywhere else.
module.exports = async function adminRoutes(fastify) {
  fastify.get(
    '/profile',
    {
      preHandler: [verifyToken, requireRole(['ADMIN', 'MANAGER'])]
    },
    adminProfileHandler
  )
}
