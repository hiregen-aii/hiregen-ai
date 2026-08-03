const env = require('./env')
const { Pool } = require('pg')

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

// error
pool.on('error', (err) => {
  console.error('[DB ERROR]', err.message)
})

// export
module.exports = {
  query: (text, params) => pool.query(text, params),
  health: () => pool.query('SELECT 1'),
  close: () => pool.end()
}
