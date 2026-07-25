const jwt = require('jsonwebtoken')
const env = require('../config/env')

function verifyToken(request, reply, done) {
  const authHeader = request.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    reply.code(401).send({
      success: false,
      data: null,
      error: { message: 'No token provided' },
      meta: { requestId: request.id }
    })
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET)
    request.user = decoded
    done()
  } catch (err) {
    reply.code(401).send({
      success: false,
      data: null,
      error: { message: 'Invalid or expired token' },
      meta: { requestId: request.id }
    })
  }
}

module.exports = { verifyToken }
