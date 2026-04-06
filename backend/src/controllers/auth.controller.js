import { z } from 'zod'
import {
  login,
  refreshSession,
  revokeRefreshToken,
} from '../services/auth.service.js'

const loginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(128),
})

const refreshSchema = z.object({
  refreshToken: z.string().min(64).max(256),
})

function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim().slice(0, 45)
  }
  return req.socket?.remoteAddress?.slice(0, 45) ?? ''
}

export async function postLogin(req, res, next) {
  try {
    const parsed = loginSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Invalid request',
        code: 'VALIDATION_ERROR',
        details: parsed.error.flatten(),
      })
    }

    const { email, password } = parsed.data
    const result = await login({
      email,
      password,
      ip: clientIp(req),
      userAgent: req.headers['user-agent'] ?? '',
    })

    return res.status(200).json(result)
  } catch (e) {
    if (e.code === 'INVALID_CREDENTIALS') {
      return res.status(401).json({
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS',
      })
    }
    if (e.code === 'LOCKED') {
      return res.status(423).json({
        error: 'Account temporarily locked. Try again later.',
        code: 'ACCOUNT_LOCKED',
      })
    }
    next(e)
  }
}

export async function postRefresh(req, res, next) {
  try {
    const parsed = refreshSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Invalid request',
        code: 'VALIDATION_ERROR',
        details: parsed.error.flatten(),
      })
    }

    const result = await refreshSession({
      rawRefreshToken: parsed.data.refreshToken,
      ip: clientIp(req),
      userAgent: req.headers['user-agent'] ?? '',
    })

    return res.status(200).json(result)
  } catch (e) {
    if (e.code === 'INVALID_REFRESH') {
      return res.status(401).json({
        error: 'Invalid or expired refresh token',
        code: 'INVALID_REFRESH',
      })
    }
    next(e)
  }
}

export async function postLogout(req, res, next) {
  try {
    const parsed = refreshSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Invalid request',
        code: 'VALIDATION_ERROR',
      })
    }
    await revokeRefreshToken(parsed.data.refreshToken)
    return res.status(204).send()
  } catch (e) {
    next(e)
  }
}

export function getMe(req, res) {
  return res.status(200).json({
    sub: req.auth.sub,
    email: req.auth.email,
    role: req.auth.role,
  })
}
