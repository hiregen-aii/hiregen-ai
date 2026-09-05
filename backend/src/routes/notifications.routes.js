const {
  getNotificationsHandler,
  markReadHandler,
  markAllReadHandler
} = require('../controllers/notifications.controller')

const { verifyToken } = require('../middleware/authenticate')

module.exports = async function (fastify) {
  fastify.addHook('preHandler', verifyToken)

  // No role restriction — every authenticated user sees their OWN
  // notifications only (scoped by request.user.id in the repository).
  fastify.get('/', getNotificationsHandler)
  fastify.patch('/:id/read', markReadHandler)
  fastify.patch('/read-all', markAllReadHandler)
}