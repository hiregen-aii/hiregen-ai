const Fastify = require('fastify')

const emailEventsRoutes = require('./routes/emailEvents')
const meetingsRoutes = require('./routes/meetings')

const app = Fastify({
  logger: true
})

// Home Route
app.get('/', async () => {
  return {
    message: 'Communication Service is running 🚀'
  }
})

// Register Routes
app.register(emailEventsRoutes)
app.register(meetingsRoutes)

// Start Server
const start = async () => {
  try {
    await app.listen({
      port: 3000,
      host: '0.0.0.0'
    })

    console.log('🚀 Server is running at http://localhost:3000')
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()