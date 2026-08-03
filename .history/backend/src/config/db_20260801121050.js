const env = require('./env')
const { Pool } = require('pg')

console.log('DATABASE_URL =', env.DATABASE_URL)
console.log('DB_USER =', env.DB_USER)
console.log('DB_PASSWORD =', env.DB_PASSWORD)
console.log('DB_NAME =', env.DB_NAME)

const poolConfig = env.DATABASE_URL
  ? { connectionString: env.DATABASE_URL }
  : {
      host: env.DB_HOST,
      port: parseInt(env.DB_PORT, 10),
      database: env.DB_NAME,
      user: env.DB_USER,
      password: env.DB_PASSWORD
    }

const pool = new Pool({
  ...poolConfig,
  max: 10,
  connectionTimeoutMillis: 5000
})

// Log unexpected database errors
pool.on('error', (err) => {
  console.error('[DB ERROR]', err.message)
})

module.exports = {
  query: (text, params) => pool.query(text, params),
  health: () => pool.query('SELECT 1'),
  close: () => pool.end()
}