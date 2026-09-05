const {
  getNotificationsForUser,
  markNotificationRead,
  markAllNotificationsRead
} = require('../repositories/notifications.repository')

const getNotificationsHandler = async (request, reply) => {
  try {
    const unreadOnly = request.query.unreadOnly === 'true'
    const limit = Math.min(parseInt(request.query.limit, 10) || 20, 100)

    const notifications = await getNotificationsForUser(request.user.id, unreadOnly, limit)

    return reply.send({ success: true, data: notifications })
  } catch (err) {
    request.log.error(err)
    return reply.code(500).send({ success: false, message: 'Unable to load notifications' })
  }
}

const markReadHandler = async (request, reply) => {
  try {
    const { id } = request.params
    const notification = await markNotificationRead(id, request.user.id)

    if (!notification) {
      return reply.code(404).send({ success: false, message: 'Notification not found' })
    }

    return reply.send({ success: true, data: notification })
  } catch (err) {
    request.log.error(err)
    return reply.code(500).send({ success: false, message: 'Unable to update notification' })
  }
}

const markAllReadHandler = async (request, reply) => {
  try {
    const count = await markAllNotificationsRead(request.user.id)
    return reply.send({ success: true, message: `${count} notifications marked read` })
  } catch (err) {
    request.log.error(err)
    return reply.code(500).send({ success: false, message: 'Unable to update notifications' })
  }
}

module.exports = { getNotificationsHandler, markReadHandler, markAllReadHandler }