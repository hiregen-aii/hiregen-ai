const fs = require('node:fs')
const path = require('node:path')
const { Client } = require('pg')

async function main() {
  const envPath = path.resolve(__dirname, '..', '.env')
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath })
  }

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL is required to run migrations')
  }

  const client = new Client({ connectionString })
  await client.connect()

  try {
    const migrationsDir = path.resolve(__dirname, '..', 'migrations')
    const files = fs.readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort()

    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
      try {
        await client.query(sql)
        console.log(`[MIGRATION] Applied ${file}`)
      } catch (err) {
        if (err.message && /already exists|does not exist|relation|type/i.test(err.message)) {
          console.warn(`[MIGRATION] Skipped ${file}: ${err.message}`)
        } else {
          throw err
        }
      }
    }
  } finally {
    await client.end()
  }
}

main().catch((err) => {
  console.error('[MIGRATION ERROR]', err.message)
  process.exit(1)
})
