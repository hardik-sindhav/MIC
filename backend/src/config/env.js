import dotenv from 'dotenv'
import ms from 'ms'
import { z } from 'zod'

dotenv.config()

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    HOST: z.string().default('0.0.0.0'),
    PORT: z.coerce.number().int().positive().default(5000),

    MONGODB_URI: z.preprocess(
      (v) => (v === undefined || v === null || String(v).trim() === '' ? undefined : String(v).trim()),
      z.string().min(10).optional(),
    ),
    MONGO_HOST: z.string().default('localhost'),
    MONGO_PORT: z.coerce.number().int().positive().default(27017),
    MONGO_DB_NAME: z.string().min(1).default('mic_database'),
    MONGO_USERNAME: z.string().optional().default(''),
    MONGO_PASSWORD: z.string().optional().default(''),

    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    JWT_ACCESS_EXPIRES: z.string().default('15m'),
    JWT_REFRESH_EXPIRES: z.string().default('7d'),

    ADMIN_EMAIL: z.preprocess(
      (v) => (v === undefined || v === null ? '' : String(v).trim()),
      z.union([z.string().email(), z.literal('')]),
    ),
    ADMIN_PASSWORD: z.preprocess(
      (v) => (v === undefined || v === null ? '' : String(v)),
      z.union([z.string().min(8).max(128), z.literal('')]),
    ),

    CORS_ORIGINS: z.string().default(''),

    LOGIN_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20),
    LOGIN_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900_000),

    AUTH_MAX_FAILED_ATTEMPTS: z.coerce.number().int().min(1).max(20).default(5),
    AUTH_LOCKOUT_MS: z.coerce.number().int().positive().default(900_000),

    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  })
  .superRefine((data, ctx) => {
    const hasEmail = data.ADMIN_EMAIL.length > 0
    const hasPassword = data.ADMIN_PASSWORD.length > 0
    if (hasEmail !== hasPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Set both ADMIN_EMAIL and ADMIN_PASSWORD for bootstrap, or leave both empty',
        path: ['ADMIN_EMAIL'],
      })
    }
    if (typeof ms(data.JWT_ACCESS_EXPIRES) !== 'number') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid JWT_ACCESS_EXPIRES (use e.g. 15m, 1h)',
        path: ['JWT_ACCESS_EXPIRES'],
      })
    }
    if (typeof ms(data.JWT_REFRESH_EXPIRES) !== 'number') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid JWT_REFRESH_EXPIRES (use e.g. 7d)',
        path: ['JWT_REFRESH_EXPIRES'],
      })
    }
  })

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors)
  console.error(parsed.error.message)
  process.exit(1)
}

export const env = parsed.data

export function buildMongoUri() {
  if (env.MONGODB_URI) {
    return env.MONGODB_URI
  }
  const user = env.MONGO_USERNAME?.trim()
  const pass = env.MONGO_PASSWORD?.trim()
  if (user && pass) {
    const u = encodeURIComponent(user)
    const p = encodeURIComponent(pass)
    return `mongodb://${u}:${p}@${env.MONGO_HOST}:${env.MONGO_PORT}/${env.MONGO_DB_NAME}?authSource=admin&directConnection=true`
  }
  return `mongodb://${env.MONGO_HOST}:${env.MONGO_PORT}/${env.MONGO_DB_NAME}?directConnection=true`
}

export function getCorsOrigins() {
  const raw = env.CORS_ORIGINS.trim()
  if (!raw) {
    if (env.NODE_ENV === 'production') {
      return ['https://admin.mic.xfinai.cloud']
    }
    // Development: include common localhost variants
    return [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:8080',
      'http://127.0.0.1:8080'
    ]
  }
  const origins = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  
  // In development, always add common localhost variants
  if (env.NODE_ENV === 'development') {
    const defaultDevOrigins = [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:8080',
      'http://127.0.0.1:8080'
    ]
    for (const origin of defaultDevOrigins) {
      if (!origins.includes(origin)) {
        origins.push(origin)
      }
    }
  }
  
  return origins
}
