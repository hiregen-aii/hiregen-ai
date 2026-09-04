const {
  getAllEmailEvents
} = require('../controllers/emailEvents.controller')

module.exports = async function (fastify) {
  fastify.get('/email-events', getAllEmailEvents)
}