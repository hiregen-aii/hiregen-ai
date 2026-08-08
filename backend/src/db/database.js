const { Pool } = require('pg')

const pool = new Pool({
  host: 'localhost',
  port: 5433,
  user: 'postgres',
  password: '12345',
  database: 'communication_service'
})

module.exports = pool