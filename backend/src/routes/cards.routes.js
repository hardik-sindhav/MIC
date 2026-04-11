import { Router } from 'express'
import {
  deleteCard,
  getCardById,
  getCards,
  getDeletedCards,
  patchCard,
  postCard,
  restoreCard,
  permanentDeleteCard,
} from '../controllers/cards.controller.js'
import { requireAuth } from '../middleware/authenticate.js'
import { upload } from '../middleware/upload.js'

const r = Router()

r.get('/deleted', requireAuth, getDeletedCards)
r.get('/', requireAuth, getCards)
r.get('/:id', requireAuth, getCardById)
r.post('/', requireAuth, upload.single('image'), postCard)
r.post('/:id/restore', requireAuth, restoreCard)
r.patch('/:id', requireAuth, upload.single('image'), patchCard)
r.delete('/:id', requireAuth, deleteCard)
r.delete('/:id/permanent', requireAuth, permanentDeleteCard)

export const cardsRoutes = r
