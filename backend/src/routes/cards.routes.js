import { Router } from 'express'
import {
  deleteCard,
  getCards,
  getDeletedCards,
  patchCard,
  postCard,
  restoreCard,
} from '../controllers/cards.controller.js'
import { requireAuth } from '../middleware/authenticate.js'

const r = Router()

r.get('/deleted', requireAuth, getDeletedCards)
r.get('/', requireAuth, getCards)
r.post('/', requireAuth, postCard)
r.post('/:id/restore', requireAuth, restoreCard)
r.patch('/:id', requireAuth, patchCard)
r.delete('/:id', requireAuth, deleteCard)

export const cardsRoutes = r
