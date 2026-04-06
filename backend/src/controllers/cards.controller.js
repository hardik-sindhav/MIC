import mongoose from 'mongoose'
import { z } from 'zod'
import {
  createCard,
  listCards,
  listDeletedCards,
  restoreCardById,
  softDeleteCardById,
  updateCardById,
} from '../services/cards.service.js'

/** 5 MB file as base64 data URL ≈ 6.7M chars — cap slightly above */
const MAX_DATA_URL_CHARS = 7_200_000

function isDataImage(v) {
  const t = v.trim()
  return t.startsWith('data:image/') && t.length <= MAX_DATA_URL_CHARS
}

function isLegacyImageUrl(v) {
  const t = v.trim()
  try {
    const u = new URL(t)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

const imageSchema = z
  .string()
  .min(1, 'Card image is required')
  .refine((v) => isDataImage(v), { message: 'Image must be an uploaded file (data URL), max 5 MB' })

/** Update: allow keeping an existing https image or a new data URL */
const updateImageSchema = z
  .string()
  .min(1, 'Card image is required')
  .refine((v) => isDataImage(v) || isLegacyImageUrl(v), {
    message: 'Image must be a data URL (max 5 MB) or valid http(s) link',
  })

const createBodySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  image: imageSchema,
  totalHp: z.coerce.number().int().min(0).max(999999),
  totalAttack: z.coerce.number().int().min(0).max(999999),
  totalDefense: z.coerce.number().int().min(0).max(999999),
  totalMagic: z.coerce.number().int().min(0).max(999999),
  stars: z.coerce.number().int().min(1).max(5),
  rarity: z.coerce.number().int().min(0).max(100),
  active: z.boolean(),
})

const updateBodySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  image: updateImageSchema,
  totalHp: z.coerce.number().int().min(0).max(999999),
  totalAttack: z.coerce.number().int().min(0).max(999999),
  totalDefense: z.coerce.number().int().min(0).max(999999),
  totalMagic: z.coerce.number().int().min(0).max(999999),
  stars: z.coerce.number().int().min(1).max(5),
  rarity: z.coerce.number().int().min(0).max(100),
  active: z.boolean(),
})

export async function postCard(req, res, next) {
  try {
    const parsed = createBodySchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: parsed.error.flatten(),
      })
    }
    const card = await createCard(parsed.data)
    return res.status(201).json(card.toObject())
  } catch (e) {
    next(e)
  }
}

export async function getCards(_req, res, next) {
  try {
    const items = await listCards()
    return res.status(200).json({ items })
  } catch (e) {
    next(e)
  }
}

export async function patchCard(req, res, next) {
  try {
    const { id } = req.params
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid card id' })
    }
    const parsed = updateBodySchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: parsed.error.flatten(),
      })
    }
    const card = await updateCardById(id, parsed.data)
    if (!card) {
      return res.status(404).json({ error: 'Card not found' })
    }
    return res.status(200).json(card.toObject())
  } catch (e) {
    next(e)
  }
}

export async function deleteCard(req, res, next) {
  try {
    const { id } = req.params
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid card id' })
    }
    const archived = await softDeleteCardById(id)
    if (!archived) {
      return res.status(404).json({ error: 'Card not found or already archived' })
    }
    return res.status(200).json({
      ok: true,
      archivedAt: archived.deletedAt,
      card: archived.toObject(),
    })
  } catch (e) {
    next(e)
  }
}

export async function getDeletedCards(_req, res, next) {
  try {
    const items = await listDeletedCards()
    return res.status(200).json({ items })
  } catch (e) {
    next(e)
  }
}

export async function restoreCard(req, res, next) {
  try {
    const { id } = req.params
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid card id' })
    }
    const card = await restoreCardById(id)
    if (!card) {
      return res.status(404).json({ error: 'Card not found or not archived' })
    }
    return res.status(200).json(card.toObject())
  } catch (e) {
    next(e)
  }
}
