import { Router } from 'express'
import { getDashboard, getTopPerformanceController } from '../controllers/stats.controller.js'
import { requireAuth } from '../middleware/authenticate.js'

const r = Router()

r.get('/dashboard', requireAuth, getDashboard)
r.get('/top-performance', requireAuth, getTopPerformanceController)

export const statsRoutes = r
