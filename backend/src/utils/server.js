// env
const bcrypt = require('bcrypt')
const env = require('./config/env')
const db = require('./config/db')
const AppError = require('./utils/AppError')
const { error: errResponse } = require('./utils/response')
const { generalLimit } = require('./middleware/rateLimit')
const { upsertAdminUser } = require('./repositories/user.repository')

// fastify config
const fastify = require('fastify')({
  logger: env.NODE_ENV === 'development',
  trustProxy: true // security: prevents IP spoofing behind proxy
})

// security plugins
fastify.register(require('@fastify/cors'), {
  origin: env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : true,
  credentials: true
})

fastify.register(require('@fastify/helmet'))
fastify.register(require('@fastify/rate-limit'), generalLimit)
fastify.register(require('./routes/auth'))
fastify.register(require('./routes/admin'))

// health route
fastify.get('/health', async (request, reply) => {
  try {
    await db.health()
    return reply.send({
      success: true,
      data: { status: 'healthy' },
      error: null,
      meta: { requestId: request.id }
    })
  } catch (err) {
    throw new AppError('Database down', 500)
  }
})

// global handler
fastify.setErrorHandler((err, request, reply) => {
  if (err.isOperational) {
    return reply.code(err.statusCode).send(errResponse(err.message, request.id))
  }
  
  if (err.validation || err.statusCode === 400) {
    return reply.code(400).send(errResponse(err.message, request.id))
  }

  // security: hide internal error details in production
  request.log.error(err)
  const clientMessage = env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message

  return reply.code(500).send(errResponse(clientMessage, request.id))
})

// 404 handler
fastify.setNotFoundHandler((request, reply) => {
  reply.code(404).send(errResponse('Route not found', request.id))
})

async function seedAdminUser() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@hiregen.ai'
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123'
  const passwordHash = await bcrypt.hash(adminPassword, 10)

  await upsertAdminUser(adminEmail, passwordHash, 'System Admin', 'ADMIN')
  console.log(`[AUTH] Admin seed ensured for ${adminEmail}`)
}

// start
async function start() {
  try {
    await db.health()
    console.log('[DB] Connected')
    await seedAdminUser()

    await fastify.listen({
      port: parseInt(env.PORT, 10),
      host: '0.0.0.0'
    })
    console.log(`[SERVER] Port: ${env.PORT}`)
  } catch (err) {
    console.error('[STARTUP ERROR]', err.message)
    process.exit(1)
  }
}

// shutdown
const stop = async () => {
  console.log('[SHUTDOWN] Stopping')
  try {
    await fastify.close()
    await db.close()
    process.exit(0)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

process.on('SIGTERM', stop)
process.on('SIGINT', stop)

start()
module.exports = fastify
