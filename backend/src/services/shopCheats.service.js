import { ShopCheat } from '../models/ShopCheat.js'

/** API shape: legacy docs may still have `cheatType` in MongoDB */
function normalizeShopChestLean(doc) {
  if (!doc || typeof doc !== 'object') return doc
  const { cheatType, ...rest } = doc
  const chestType = rest.chestType ?? cheatType ?? ''
  return { ...rest, chestType }
}

export async function createShopCheat(payload) {
  const doc = await ShopCheat.create({
    name: payload.name.trim(),
    chestType: payload.chestType.trim(),
    price: payload.price,
    totalCards: payload.totalCards,
    rareCardCount: payload.rareCardCount,
    offer: (payload.offer ?? '').trim(),
    extraCardBonus: payload.extraCardBonus,
    active: payload.active,
  })
  return doc
}

export async function listShopCheats() {
  const rows = await ShopCheat.find().sort({ updatedAt: -1 }).lean()
  return rows.map(normalizeShopChestLean)
}

export async function updateShopCheatById(id, payload) {
  const row = await ShopCheat.findById(id)
  if (!row) return null

  row.name = payload.name.trim()
  row.chestType = payload.chestType.trim()
  row.price = payload.price
  row.totalCards = payload.totalCards
  row.rareCardCount = payload.rareCardCount
  row.offer = (payload.offer ?? '').trim()
  row.extraCardBonus = payload.extraCardBonus
  row.active = payload.active

  await row.save()
  return row
}

export async function deleteShopCheatById(id) {
  const res = await ShopCheat.findByIdAndDelete(id)
  return Boolean(res)
}
