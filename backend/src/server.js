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

// FIX: auth/admin now registered with explicit /api/v1 prefixes too —
// previously hardcoded /api/auth/... and /api/admin/... inside the route
// files themselves, inconsistent with the rest of the API.
fastify.register(require('./routes/auth'), { prefix: '/api/v1/auth' })
fastify.register(require('./routes/admin'), { prefix: '/api/v1/admin' })

// FIX: all API prefixes standardized to /api/v1/... per SRS §14 API
// Contracts (was inconsistently /api/hiring-signals, /api/webhooks,
// /api/agents/... across different contributors' branches before).
fastify.register(
    require("./routes/hiring-signals.routes"),
    {
        prefix: "/api/v1/hiring-signals"
    }
);

fastify.register(
    require("./routes/leads.routes"),
    {
        prefix: "/api/v1/leads"
    }
);

// Team 2 (2.2/2.3 Enrichment) — companies/contacts CRUD.
fastify.register(require("./routes/companies.routes"), { prefix: "/api/v1/companies" });
fastify.register(require("./routes/contacts.routes"), { prefix: "/api/v1/contacts" });

// Service-to-service (n8n) endpoints — separate prefix, NOT behind
// verifyToken/requireRole, since n8n can't hold a user JWT. This currently
// only has payload validation (see webhookRoutes.js) — API-key + HMAC
// signature verification per SRS §14/§18 is still an open item, tracked
// against Team 1 (platform/security). Do not point real n8n traffic at
// this until that lands.
const webhookRoutes = require("./routes/webhookRoutes");

fastify.register(webhookRoutes, {
    prefix: "/api/v1/webhooks",
});

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
      host: process.env.HOST || '127.0.0.1'
    })
    console.log(`[SERVER] Port: ${env.PORT}`)
  } catch (err) {
    console.error("========== STARTUP ERROR ==========");
    console.error(err);
    console.error("===================================");
    process.exit(1);
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