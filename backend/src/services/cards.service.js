import { Card } from '../models/Card.js'

/** Active catalog rows (not soft-deleted) */
export const activeCardFilter = {
  $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
}

function slugify(name) {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
  return base || 'card'
}

async function slugTakenAmongActive(slug, excludeId = null) {
  const q = { slug, ...activeCardFilter }
  if (excludeId) q._id = { $ne: excludeId }
  return Card.exists(q)
}

export async function createCard(payload) {
  let base = slugify(payload.name)
  let slug = base
  let n = 0
  while (await slugTakenAmongActive(slug)) {
    n += 1
    slug = `${base}-${n}`
  }

  const doc = await Card.create({
    name: payload.name.trim(),
    slug,
    image: payload.image.trim(),
    totalHp: payload.totalHp,
    totalAttack: payload.totalAttack,
    totalDefense: payload.totalDefense,
    totalMagic: payload.totalMagic,
    stars: payload.stars,
    rarity: payload.rarity,
    active: payload.active,
    deletedAt: null,
  })

  return doc
}

export async function listCards() {
  return Card.find(activeCardFilter).sort({ updatedAt: -1 }).lean()
}

export async function listDeletedCards() {
  return Card.find({ deletedAt: { $ne: null } }).sort({ deletedAt: -1 }).lean()
}

export async function updateCardById(id, payload) {
  const card = await Card.findOne({ _id: id, ...activeCardFilter })
  if (!card) return null

  const newName = payload.name.trim()
  if (newName !== card.name) {
    let base = slugify(newName)
    let slug = base
    let n = 0
    while (await slugTakenAmongActive(slug, id)) {
      n += 1
      slug = `${base}-${n}`
    }
    card.slug = slug
  }

  card.name = newName
  card.image = payload.image.trim()
  card.totalHp = payload.totalHp
  card.totalAttack = payload.totalAttack
  card.totalDefense = payload.totalDefense
  card.totalMagic = payload.totalMagic
  card.stars = payload.stars
  card.rarity = payload.rarity
  card.active = payload.active

  await card.save()
  return card
}

export async function softDeleteCardById(id) {
  /** Clear slug so the slug string can be reused by active cards (avoids unique-index conflicts). */
  const card = await Card.findOneAndUpdate(
    { _id: id, ...activeCardFilter },
    { $set: { deletedAt: new Date(), slug: null } },
    { new: true },
  )
  return card
}

export async function restoreCardById(id) {
  const card = await Card.findById(id)
  if (!card || !card.deletedAt) return null

  let base = slugify(card.name)
  let slug = base
  let n = 0
  while (await slugTakenAmongActive(slug, id)) {
    n += 1
    slug = `${base}-${n}`
  }
  card.slug = slug
  card.deletedAt = null
  await card.save()
  return card
}

/** Count for dashboard — active cards only */
export async function countActiveCards() {
  return Card.countDocuments(activeCardFilter)
}
