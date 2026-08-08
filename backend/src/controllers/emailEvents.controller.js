const {
  getAllEmailEvents
} = require('../repositories/emailEvents.repository')

// Get All Email Events
const getAllEmailEventsHandler = async (request, reply) => {
  try {
    const emailEvents = await getAllEmailEvents()

    return reply.send({
      success: true,
      data: emailEvents
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
  getAllEmailEvents: getAllEmailEventsHandler
}