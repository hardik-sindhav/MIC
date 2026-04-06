import mongoose from 'mongoose'
import { z } from 'zod'
import {
  createShopCheat,
  deleteShopCheatById,
  listShopCheats,
  updateShopCheatById,
} from '../services/shopCheats.service.js'

const bodySchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(200),
    chestType: z.string().trim().min(1, 'Chest type is required').max(120),
    price: z.coerce.number().min(0).max(1_000_000_000),
    totalCards: z.coerce.number().int().min(0).max(1_000_000),
    rareCardCount: z.coerce.number().int().min(0).max(1_000_000),
    offer: z.string().trim().max(500).optional().default(''),
    extraCardBonus: z.coerce.number().int().min(0).max(1_000_000),
    active: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.rareCardCount > data.totalCards) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Rare Card count cannot exceed total card count.',
        path: ['rareCardCount'],
      })
    }
  })

export async function getShopCheats(_req, res, next) {
  try {
    const items = await listShopCheats()
    return res.status(200).json({ items })
  } catch (e) {
    next(e)
  }
}

export async function postShopCheat(req, res, next) {
  try {
    const parsed = bodySchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: parsed.error.flatten(),
      })
    }
    const doc = await createShopCheat(parsed.data)
    return res.status(201).json(doc.toObject())
  } catch (e) {
    next(e)
  }
}

export async function patchShopCheat(req, res, next) {
  try {
    const { id } = req.params
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid id' })
    }
    const parsed = bodySchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: parsed.error.flatten(),
      })
    }
    const row = await updateShopCheatById(id, parsed.data)
    if (!row) {
      return res.status(404).json({ error: 'Treasure chest not found' })
    }
    return res.status(200).json(row.toObject())
  } catch (e) {
    next(e)
  }
}

export async function deleteShopCheat(req, res, next) {
  try {
    const { id } = req.params
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid id' })
    }
    const ok = await deleteShopCheatById(id)
    if (!ok) {
      return res.status(404).json({ error: 'Treasure chest not found' })
    }
    return res.status(200).json({ ok: true })
  } catch (e) {
    next(e)
  }
}
