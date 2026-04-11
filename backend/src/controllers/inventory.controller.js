import * as inventoryService from '../services/inventory.service.js'
import { User } from '../models/User.js'

export async function postClaimWelcome(req, res, next) {
  try {
    const cards = await inventoryService.claimWelcomeReward(req.auth.sub)
    return res.status(200).json({
      success: true,
      message: 'Welcome reward claimed successfully',
      cards,
    })
  } catch (e) {
    if (e.message === 'Welcome reward already claimed') {
      return res.status(400).json({ error: e.message, code: 'ALREADY_CLAIMED' })
    }
    next(e)
  }
}

/**
 * After a rewarded ad: grants a pack. Capped by AppSettings.rewardAdMaxPerDay (UTC day); 0 = unlimited.
 * Skips global /api rate limit (see rateLimiters).
 */
export async function postClaimRewardPack(req, res, next) {
  try {
    const { newCount, cards } = await inventoryService.claimRewardPack(req.auth.sub)
    return res.status(200).json({
      success: true,
      message: 'Reward pack processed',
      newCount,
      cards,
    })
  } catch (e) {
    if (e.code === 'REWARD_AD_DAILY_LIMIT') {
      return res.status(403).json({
        error: e.message,
        code: e.code,
        maxPerDay: e.maxPerDay,
        usedToday: e.usedToday,
        dayUtc: e.dayUtc,
      })
    }
    next(e)
  }
}

export async function getRewardAdStatus(req, res, next) {
  try {
    const status = await inventoryService.getRewardAdStatusForUser(req.auth.sub)
    return res.status(200).json(status)
  } catch (e) {
    next(e)
  }
}

export async function getUserInventory(req, res, next) {
  try {
    const user = await User.findById(req.auth.sub)
      .populate({
        path: 'inventory.cardId',
        select: 'name image stars rarity type abilities totalHp totalAttack totalDefense totalMagic slug'
      })
      .lean()
    
    if (!user) return res.status(404).json({ error: 'User not found' })

    const inventory = Array.isArray(user.inventory) ? user.inventory : []
    const cards = inventory
      .filter((item) => item?.cardId != null)
      .map((item) => ({
        ...item.cardId,
        count: item.count ?? 1,
      }))

    return res.status(200).json({ cards })
  } catch (e) {
    next(e)
  }
}
