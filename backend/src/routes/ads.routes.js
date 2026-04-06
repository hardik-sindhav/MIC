import { Router } from 'express'
import { getAdConfigPublic, putAdConfig } from '../controllers/adConfig.controller.js'
import { requireAuth } from '../middleware/authenticate.js'

const r = Router()

r.get('/config', getAdConfigPublic)
r.put('/config', requireAuth, putAdConfig)

export const adsRoutes = r
