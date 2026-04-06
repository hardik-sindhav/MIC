import { env } from '../config/env.js'

export function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Not found' })
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    next(err)
    return
  }

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'Forbidden', code: 'CORS' })
  }
  if (typeof err.message === 'string' && err.message.startsWith('CORS:')) {
    return res.status(503).json({ error: 'Server misconfiguration', code: 'CORS_NOT_CONFIGURED' })
  }

  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      error: 'Request body too large. Try a smaller image (max 5 MB).',
      code: 'PAYLOAD_TOO_LARGE',
    })
  }

  const status = err.status ?? err.statusCode ?? 500
  const message =
    status >= 500 && env.NODE_ENV === 'production' ? 'Internal server error' : err.message

  const body = {
    error: message,
    ...(err.code && { code: err.code }),
    ...(env.NODE_ENV === 'development' && err.stack && { stack: err.stack }),
  }

  res.status(status).json(body)
}
