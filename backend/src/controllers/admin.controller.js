const { success, error } = require('../utils/response')

async function adminProfileHandler(request, reply) {
  try {
    return reply.code(200).send(success({
      message: 'Admin access confirmed',
      user: request.user
    }, request.id))
  } catch (err) {
    return reply.code(500).send(error('Unable to load admin profile', request.id))
  }
}

module.exports = { adminProfileHandler }
