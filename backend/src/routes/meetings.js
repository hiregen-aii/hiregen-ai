const {
  getAllMeetings
} = require('../controllers/meetings.controller')

module.exports = async function (fastify) {
  fastify.get('/meetings', getAllMeetings)
}