import rateLimit from 'express-rate-limit'
import { env } from '../config/env.js'

/** Authenticated reward-pack opens are intentionally not capped by the global API limiter. */
function skipRateLimitForRewardPackClaim(req) {
  if (req.method !== 'POST') return false
  const path = (req.originalUrl || '').split('?')[0].replace(/\/+$/, '') || ''
  return path.endsWith('/inventory/claim-reward-pack')
}

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: env.NODE_ENV === 'production' ? 200 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests', code: 'RATE_LIMIT' },
  skip: skipRateLimitForRewardPackClaim,
})

export const loginLimiter = rateLimit({
  windowMs: env.LOGIN_RATE_LIMIT_WINDOW_MS,
  max: env.LOGIN_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts', code: 'LOGIN_RATE_LIMIT' },
  skipSuccessfulRequests: true,
})
