const {
  getAllMeetings
} = require('../repositories/meetings.repository')

// Get All Meetings
const getAllMeetingsHandler = async (request, reply) => {
  try {
    const meetings = await getAllMeetings()

    return reply.send({
      success: true,
      data: meetings
    })
  } catch (err) {
    console.error(err)

    return reply.code(500).send({
      success: false,
      message: err.message
    })
  }
}

module.exports = {
  getAllMeetings: getAllMeetingsHandler
}