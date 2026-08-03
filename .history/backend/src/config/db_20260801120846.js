const env = require('./env')
const { Pool } = require('pg')

console.log('DATABASE_URL =', env.DATABASE_URL)
console.log('DB_USER =', env.DB_USER)
console.log('DB_PASSWORD =', env.DB_PASSWORD)
console.log('DB_NAME =', env.DB_NAME)