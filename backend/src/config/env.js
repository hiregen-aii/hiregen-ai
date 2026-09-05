const fs = require('node:fs')
const path = require('node:path')
const dotenv = require('dotenv')
const { z } = require('zod')

const candidates = [
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../../../.env'),
  path.resolve(process.cwd(), '.env')
]

for (const candidate of candidates) {
  if (fs.existsSync(candidate)) {
    dotenv.config({ path: candidate })
    break
  }
}

if (!process.env.JWT_SECRET || !process.env.REFRESH_SECRET) {
  dotenv.config()
}

const requiredKeys = [
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'JWT_SECRET',
  'REFRESH_SECRET',
  'PORT'
]

const missingKeys = requiredKeys.filter((key) => !process.env[key] || process.env[key] === '')

if (missingKeys.length > 0) {
  console.error('[ENV ERROR] Missing required environment variables:', missingKeys.join(', '))
  process.exit(1)
}

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535),
  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().min(1).max(65535),
  DB_NAME: z.string().min(1),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  REFRESH_SECRET: z.string().min(32),
  FRONTEND_URL: z.string().url().optional(),
  DATABASE_URL: z.string().url().optional()
})

const result = schema.safeParse(process.env)

if (!result.success) {
  console.error('[ENV ERROR] Configuration validation failed:', result.error.format())
  process.exit(1)
}

const env = result.data

module.exports = {
  ...env,
  PORT: String(env.PORT),
  DB_PORT: String(env.DB_PORT)
}
