import { verifyAccessToken } from '../services/auth.service.js'

/**
 * Requires `Authorization: Bearer <accessToken>`
 */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization
  if (!header || typeof header !== 'string' || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized', code: 'NO_TOKEN' })
  }

  const token = header.slice(7).trim()
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized', code: 'NO_TOKEN' })
  }

  try {
    const payload = verifyAccessToken(token)
    if (payload.typ !== 'access') {
      return res.status(401).json({ error: 'Unauthorized', code: 'INVALID_TOKEN_TYPE' })
    }
    req.auth = {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
    }
    return next()
  } catch {
    return res.status(401).json({ error: 'Unauthorized', code: 'TOKEN_EXPIRED_OR_INVALID' })
  }
}
