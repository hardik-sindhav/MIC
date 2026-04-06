import { Router } from 'express'
import {
  deleteShopCheat,
  getShopCheats,
  patchShopCheat,
  postShopCheat,
} from '../controllers/shopCheats.controller.js'
import { requireAuth } from '../middleware/authenticate.js'

const r = Router()

const treasure = '/treasure-chests'
r.get(treasure, requireAuth, getShopCheats)
r.post(treasure, requireAuth, postShopCheat)
r.patch(`${treasure}/:id`, requireAuth, patchShopCheat)
r.delete(`${treasure}/:id`, requireAuth, deleteShopCheat)

/** @deprecated Prefer /treasure-chests — kept for older admin builds */
r.get('/cheats', requireAuth, getShopCheats)
r.post('/cheats', requireAuth, postShopCheat)
r.patch('/cheats/:id', requireAuth, patchShopCheat)
r.delete('/cheats/:id', requireAuth, deleteShopCheat)

export const shopRoutes = r
