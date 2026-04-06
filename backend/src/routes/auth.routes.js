import { Router } from 'express'
import {
  getMe,
  postLogin,
  postLogout,
  postRefresh,
} from '../controllers/auth.controller.js'
import { requireAuth } from '../middleware/authenticate.js'
import { loginLimiter } from '../middleware/rateLimiters.js'

const r = Router()

r.post('/login', loginLimiter, postLogin)
r.post('/refresh', postRefresh)
r.post('/logout', postLogout)
r.get('/me', requireAuth, getMe)

export const authRoutes = r
