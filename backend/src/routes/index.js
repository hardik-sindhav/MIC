import { Router } from 'express'
import { adsRoutes } from './ads.routes.js'
import { authRoutes } from './auth.routes.js'
import { cardsRoutes } from './cards.routes.js'
import { shopRoutes } from './shop.routes.js'
import { statsRoutes } from './stats.routes.js'

export const apiRouter = Router()

apiRouter.use('/auth', authRoutes)
apiRouter.use('/stats', statsRoutes)
apiRouter.use('/cards', cardsRoutes)
apiRouter.use('/shop', shopRoutes)
apiRouter.use('/ads', adsRoutes)
