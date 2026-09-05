// env
const bcrypt = require('bcrypt')
const env = require('./config/env')
const db = require('./config/db')
const AppError = require('./utils/AppError')
const { error: errResponse } = require('./utils/response')
const { generalLimit } = require('./middleware/rateLimit')
const { upsertAdminUser } = require('./repositories/user.repository')
const client = require('prom-client')

client.collectDefaultMetrics()


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

// NEW — Approval Queue, Campaigns, Analytics: repositories existed with
// no route ever registering them. Closing that gap (see
// backend-route-gaps-spec.md for the original finding).
fastify.register(require("./routes/approval.routes"), { prefix: "/api/v1/approval" });
fastify.register(require("./routes/campaigns.routes"), { prefix: "/api/v1/campaigns" });
fastify.register(require("./routes/analytics.routes"), { prefix: "/api/v1/analytics" });

// NEW — Notifications: see settings-notifications-architecture-plan.md.
// Polling-based (no Socket.IO server) — frontend refetches on an interval.
fastify.register(require("./routes/notifications.routes"), { prefix: "/api/v1/notifications" });

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

// metrics route
fastify.get('/metrics', async (request, reply) => {
  try {
    reply.header('Content-Type', client.register.contentType)
    return reply.send(await client.register.metrics())
  } catch (err) {
    reply.code(500).send(err)
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
  const adminName = process.env.ADMIN_NAME || 'Anuj Mishra'
  const passwordHash = await bcrypt.hash(adminPassword, 10)

  await upsertAdminUser(adminEmail, passwordHash, adminName, 'ADMIN')
  console.log(`[AUTH] Admin seed ensured for ${adminEmail}`)
}

async function runAutoMigrations() {
  const fs = require('node:fs')
  const path = require('node:path')
  const migrationsDir = path.resolve(__dirname, '..', 'migrations')
  if (fs.existsSync(migrationsDir)) {
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort()
    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
      try {
        await db.query(sql)
        console.log(`[MIGRATION] Applied ${file}`)
      } catch (err) {
        if (/already exists|duplicate|relation.*exists|type.*exists/i.test(err.message)) {
          // Idempotent migration - already applied
        } else {
          console.warn(`[MIGRATION] ${file}: ${err.message}`)
        }
      }
    }
  }
}

// start
async function start() {
  try {
    await db.health()
    console.log('[DB] Connected')
    await runAutoMigrations()
    await seedAdminUser()

    await fastify.listen({
      port: parseInt(env.PORT, 10),
      host: process.env.HOST || '0.0.0.0'
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