import { Card } from '../models/Card.js'
import { User } from '../models/User.js'
import { getAppSettings } from './appSettings.service.js'
import { activeCardFilter } from './cards.service.js'

const DEFAULT_STAR_CHANCES = { star1: 40, star2: 30, star3: 15, star4: 10, star5: 5 }

function getRewardAdMaxPerDay(settings) {
  const v = settings?.rewardAdMaxPerDay
  if (v === undefined || v === null) return 10
  const n = Number(v)
  if (!Number.isFinite(n)) return 10
  return Math.max(0, Math.min(500, Math.floor(n)))
}

function getRewardAdWindowMinutes(settings) {
  const v = settings?.rewardAdWindowMinutes
  if (v === undefined || v === null) return 1440
  const n = Number(v)
  if (!Number.isFinite(n)) return 1440
  return Math.max(10, Math.min(1440, Math.floor(n)))
}

function getRewardAdWindowMs(settings) {
  return getRewardAdWindowMinutes(settings) * 60 * 1000
}

/** Clear window if it has ended (mutates Mongoose user doc). */
function expireRewardAdWindowIfNeeded(user, settings, now = Date.now()) {
  const maxClaims = getRewardAdMaxPerDay(settings)
  if (maxClaims === 0) return
  const windowMs = getRewardAdWindowMs(settings)
  if (!user.rewardAdWindowStart) return
  const start = new Date(user.rewardAdWindowStart).getTime()
  if (Number.isNaN(start)) {
    user.rewardAdWindowStart = null
    user.rewardAdClaimCount = 0
    return
  }
  if (now >= start + windowMs) {
    user.rewardAdWindowStart = null
    user.rewardAdClaimCount = 0
  }
}

function checkRewardAdAllowance(user, settings) {
  const now = Date.now()
  expireRewardAdWindowIfNeeded(user, settings, now)
  const maxClaims = getRewardAdMaxPerDay(settings)
  if (maxClaims === 0) return
  const windowMs = getRewardAdWindowMs(settings)
  const windowMinutes = getRewardAdWindowMinutes(settings)
  if (user.rewardAdWindowStart && user.rewardAdClaimCount >= maxClaims) {
    const start = new Date(user.rewardAdWindowStart).getTime()
    const nextMs = start + windowMs
    const err = new Error('Reward ad limit reached for this period')
    err.code = 'REWARD_AD_DAILY_LIMIT'
    err.maxPerDay = maxClaims
    err.maxPerWindow = maxClaims
    err.usedToday = user.rewardAdClaimCount
    err.claimsUsedInWindow = user.rewardAdClaimCount
    err.windowMinutes = windowMinutes
    err.nextAvailableAt = new Date(nextMs).toISOString()
    err.secondsUntilNextClaim = Math.max(0, Math.ceil((nextMs - now) / 1000))
    throw err
  }
}

function recordRewardAdClaim(user, settings) {
  const now = Date.now()
  const maxClaims = getRewardAdMaxPerDay(settings)
  if (maxClaims === 0) return
  expireRewardAdWindowIfNeeded(user, settings, now)
  if (!user.rewardAdWindowStart) {
    user.rewardAdWindowStart = new Date(now)
  }
  user.rewardAdClaimCount = (user.rewardAdClaimCount || 0) + 1
}

/**
 * Read-only snapshot for API (lean user or doc). Applies virtual window expiry without saving.
 */
export function computeRewardAdLimitSnapshot(user, settings, now = Date.now()) {
  const maxPerWindow = getRewardAdMaxPerDay(settings)
  const windowMinutes = getRewardAdWindowMinutes(settings)
  if (maxPerWindow === 0) {
    return {
      unlimited: true,
      maxPerWindow: 0,
      maxPerDay: 0,
      windowMinutes,
      claimsUsedInWindow: 0,
      usedToday: 0,
      remaining: null,
      canClaim: true,
      nextAvailableAt: null,
      secondsUntilNextClaim: null,
    }
  }
  const windowMs = windowMinutes * 60 * 1000

  let windowStartMs = null
  if (user.rewardAdWindowStart) {
    const t = new Date(user.rewardAdWindowStart).getTime()
    if (!Number.isNaN(t)) windowStartMs = t
  }
  let count = Math.max(0, Number(user.rewardAdClaimCount || 0))

  if (windowStartMs != null && now >= windowStartMs + windowMs) {
    windowStartMs = null
    count = 0
  }

  const claimsUsedInWindow = windowStartMs == null ? 0 : count
  const remaining = Math.max(0, maxPerWindow - claimsUsedInWindow)
  const atLimit = windowStartMs != null && count >= maxPerWindow
  const nextAvailableAt =
    atLimit && windowStartMs != null ? new Date(windowStartMs + windowMs).toISOString() : null
  const secondsUntilNextClaim =
    nextAvailableAt != null
      ? Math.max(0, Math.ceil((new Date(nextAvailableAt).getTime() - now) / 1000))
      : null

  return {
    unlimited: false,
    maxPerWindow,
    maxPerDay: maxPerWindow,
    windowMinutes,
    claimsUsedInWindow,
    usedToday: claimsUsedInWindow,
    remaining,
    canClaim: !atLimit,
    nextAvailableAt,
    secondsUntilNextClaim,
  }
}

function normalizeRewardConfig(raw) {
  return {
    totalCards: Math.max(0, Number(raw?.totalCards ?? 0)),
    bonusCards: Math.max(0, Number(raw?.bonusCards ?? 0)),
    bonusCardIds: Array.isArray(raw?.bonusCardIds) ? raw.bonusCardIds : [],
    starChances: { ...DEFAULT_STAR_CHANCES, ...(raw?.starChances || {}) },
  }
}

/**
 * Build ordered list of picked card lean docs (_id, stars) from reward config.
 */
function buildPickedCardsFromConfig(config, allCards, cardsByStars) {
  const c = normalizeRewardConfig(config)
  const picked = []

  if (c.bonusCardIds.length > 0) {
    const fixed = allCards.filter((card) =>
      c.bonusCardIds.some((id) => id.toString() === card._id.toString()),
    )
    picked.push(...fixed)
  }

  const totalRandom = c.totalCards + c.bonusCards
  for (let i = 0; i < totalRandom; i++) {
    const card = pickRandomCardByStars(cardsByStars, c.starChances)
    if (card) picked.push(card)
  }

  return picked
}

function pickRandomCardByStars(cardsByStars, chances) {
  const rand = Math.random() * 100
  let cumulative = 0

  const starLevels = [1, 2, 3, 4, 5]
  for (const level of starLevels) {
    cumulative += chances[`star${level}`] || 0
    if (rand <= cumulative) {
      const pool = cardsByStars[level]
      if (pool.length > 0) {
        return pool[Math.floor(Math.random() * pool.length)]
      }
      break
    }
  }

  const allPools = Object.values(cardsByStars).flat()
  if (allPools.length > 0) {
    return allPools[Math.floor(Math.random() * allPools.length)]
  }

  return null
}

function ensureInventoryArray(user) {
  if (!Array.isArray(user.inventory)) {
    user.inventory = []
  }
}

function recomputeUserCardStats(user, allCardsLean) {
  const inv = Array.isArray(user.inventory) ? user.inventory : []
  user.cardsHeld = inv.reduce((acc, item) => acc + item.count, 0)
  user.rareCardsHeld = inv.reduce((acc, item) => {
    const card = allCardsLean.find((c) => c._id.toString() === item.cardId.toString())
    if (card && card.stars >= 4) return acc + item.count
    return acc
  }, 0)
}

/**
 * Claims the welcome reward for a user.
 * This should only be called once per user.
 */
export async function claimWelcomeReward(userId) {
  const user = await User.findById(userId)
  if (!user) throw new Error('User not found')
  ensureInventoryArray(user)
  if (user.hasClaimedWelcome) throw new Error('Welcome reward already claimed')

  const settings = await getAppSettings()
  const config = normalizeRewardConfig(
    settings.welcomeReward || {
      totalCards: 10,
      bonusCards: 0,
      starChances: DEFAULT_STAR_CHANCES,
    },
  )

  const allCards = await Card.find(activeCardFilter).select('_id stars rarity').lean()
  const cardsByStars = {
    1: allCards.filter((c) => (c.stars || 1) === 1),
    2: allCards.filter((c) => c.stars === 2),
    3: allCards.filter((c) => c.stars === 3),
    4: allCards.filter((c) => c.stars === 4),
    5: allCards.filter((c) => c.stars === 5),
  }

  const pickedCards = buildPickedCardsFromConfig(config, allCards, cardsByStars)

  if (
    pickedCards.length === 0 &&
    (!config.bonusCardIds || config.bonusCardIds.length === 0)
  ) {
    user.hasClaimedWelcome = true
    await user.save()
    return []
  }

  if (pickedCards.length > 0) {
    const inventoryUpdates = {}
    pickedCards.forEach((card) => {
      const id = card._id.toString()
      inventoryUpdates[id] = (inventoryUpdates[id] || 0) + 1
    })

    for (const [cardId, count] of Object.entries(inventoryUpdates)) {
      const existing = user.inventory.find((item) => item.cardId.toString() === cardId)
      if (existing) {
        existing.count += count
      } else {
        user.inventory.push({ cardId, count })
      }
    }

    recomputeUserCardStats(user, allCards)
  }

  user.hasClaimedWelcome = true
  await user.save()

  const fullPickedCards = await Card.find({
    _id: { $in: pickedCards.map((c) => c._id) },
  }).lean()

  const result = []
  pickedCards.forEach((p) => {
    const full = fullPickedCards.find((f) => f._id.toString() === p._id.toString())
    if (full) result.push(full)
  })

  return result
}

/**
 * Reward pack (after rewarded ad): same draw rules as rewardPack settings; only adds new cards.
 * Each card includes status "new" or "already_owned". Limited by rewardAdMaxPerDay per rolling window (rewardAdWindowMinutes; 0 = unlimited).
 */
export async function claimRewardPack(userId) {
  const user = await User.findById(userId)
  if (!user) throw new Error('User not found')
  ensureInventoryArray(user)

  const settings = await getAppSettings()
  checkRewardAdAllowance(user, settings)

  const config = normalizeRewardConfig(
    settings.rewardPack || {
      totalCards: 5,
      bonusCards: 0,
      starChances: DEFAULT_STAR_CHANCES,
    },
  )

  const allCards = await Card.find(activeCardFilter).select('_id stars rarity').lean()
  const cardsByStars = {
    1: allCards.filter((c) => (c.stars || 1) === 1),
    2: allCards.filter((c) => c.stars === 2),
    3: allCards.filter((c) => c.stars === 3),
    4: allCards.filter((c) => c.stars === 4),
    5: allCards.filter((c) => c.stars === 5),
  }

  const pickedCards = buildPickedCardsFromConfig(config, allCards, cardsByStars)

  const ownedIds = new Set(user.inventory.map((item) => item.cardId.toString()))

  const idsForPopulate = [...new Set(pickedCards.map((p) => p._id.toString()))]
  const fullById = await Card.find({ _id: { $in: idsForPopulate } }).lean()
  const fullMap = new Map(fullById.map((c) => [c._id.toString(), c]))

  const cards = []
  let newCount = 0

  for (const p of pickedCards) {
    const id = p._id.toString()
    const full = fullMap.get(id)
    if (!full) continue

    if (!ownedIds.has(id)) {
      user.inventory.push({ cardId: p._id, count: 1 })
      ownedIds.add(id)
      newCount += 1
      cards.push({ ...full, status: 'new' })
    } else {
      cards.push({ ...full, status: 'already_owned' })
    }
  }

  if (newCount > 0) {
    recomputeUserCardStats(user, allCards)
  }

  recordRewardAdClaim(user, settings)
  await user.save()

  return { newCount, cards }
}

/** For GET /inventory/reward-ad-limit and reward-ad-status — read-only, no DB write. */
export async function getRewardAdLimitForUser(userId) {
  const user = await User.findById(userId)
    .select('rewardAdWindowStart rewardAdClaimCount')
    .lean()
  if (!user) throw new Error('User not found')
  const settings = await getAppSettings()
  return computeRewardAdLimitSnapshot(user, settings)
}
