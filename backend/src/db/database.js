const { Pool } = require('pg')

const pool = new Pool({
  host: 'localhost',
  port: 5433,
  user: 'postgres',
  password: '@your password',
  database: 'communication_service'
})

module.exports = pool
