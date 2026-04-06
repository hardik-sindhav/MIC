import { Admin } from '../models/Admin.js'
import { countActiveCards } from './cards.service.js'
import { SupportTicket } from '../models/SupportTicket.js'
import { User } from '../models/User.js'

const USER_TOP_FIELDS = 'displayName email wins losses cardsHeld rareCardsHeld'

function summarizeUserForLeaderboard(doc) {
  if (!doc) return null
  const email = doc.email || ''
  const handle = email.includes('@') ? email.split('@')[0] : email
  return {
    id: String(doc._id),
    displayName: (doc.displayName && doc.displayName.trim()) || handle || 'Player',
    email,
    wins: doc.wins ?? 0,
    losses: doc.losses ?? 0,
    cardsHeld: doc.cardsHeld ?? 0,
    rareCardsHeld: doc.rareCardsHeld ?? 0,
  }
}

export async function getDashboardStats() {
  const [appUsers, admins, totalCards, openTickets] = await Promise.all([
    User.countDocuments(),
    Admin.countDocuments(),
    countActiveCards(),
    SupportTicket.countDocuments({ status: 'open' }),
  ])

  return {
    totalUsers: appUsers,
    totalAdmins: admins,
    totalCards,
    openTickets,
  }
}

/**
 * Leaderboard slices for the admin dashboard (and optional game use).
 * @param {number} [limit] entries per category, clamped 1–25
 */
export async function getTopPerformance(limit = 5) {
  const n = Math.min(25, Math.max(1, Number(limit) || 5))

  const [topWinners, topLosers, topCardHolders, topRareCardHolders] = await Promise.all([
    User.find({ wins: { $gt: 0 } })
      .sort({ wins: -1 })
      .limit(n)
      .select(USER_TOP_FIELDS)
      .lean(),
    User.find({ losses: { $gt: 0 } })
      .sort({ losses: -1 })
      .limit(n)
      .select(USER_TOP_FIELDS)
      .lean(),
    User.find({ cardsHeld: { $gt: 0 } })
      .sort({ cardsHeld: -1 })
      .limit(n)
      .select(USER_TOP_FIELDS)
      .lean(),
    User.find({ rareCardsHeld: { $gt: 0 } })
      .sort({ rareCardsHeld: -1 })
      .limit(n)
      .select(USER_TOP_FIELDS)
      .lean(),
  ])

  return {
    topWinners: topWinners.map(summarizeUserForLeaderboard),
    topLosers: topLosers.map(summarizeUserForLeaderboard),
    topCardHolders: topCardHolders.map(summarizeUserForLeaderboard),
    topRareCardHolders: topRareCardHolders.map(summarizeUserForLeaderboard),
  }
}
