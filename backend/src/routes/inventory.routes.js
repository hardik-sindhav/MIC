import { Router } from 'express'
import {
  postClaimWelcome,
  postClaimRewardPack,
  getUserInventory,
  getRewardAdStatus,
} from '../controllers/inventory.controller.js'
import { requireAuth } from '../middleware/authenticate.js'

const r = Router()

// All inventory routes require user authentication
r.use(requireAuth)

r.post('/claim-welcome', postClaimWelcome)
r.post('/claim-reward-pack', postClaimRewardPack)
r.get('/reward-ad-status', getRewardAdStatus)
r.get('/my', getUserInventory)

export const inventoryRoutes = r
