import { API_BASE_URL } from '../config/env.js'

/**
 * @param {string} accessToken
 * @returns {Promise<{ totalUsers: number, totalCards: number, openTickets: number, totalAdmins?: number }>}
 */
export async function fetchDashboardStats(accessToken) {
  const res = await fetch(`${API_BASE_URL}/api/stats/dashboard`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const err = new Error(data.error || 'Failed to load dashboard stats')
    err.status = res.status
    throw err
  }

  return data
}

/**
 * @param {string} accessToken
 * @param {{ limit?: number }} [opts]
 */
export async function fetchTopPerformance(accessToken, opts = {}) {
  const limit = opts.limit ?? 5
  const q = new URLSearchParams()
  if (limit != null) q.set('limit', String(limit))

  const res = await fetch(`${API_BASE_URL}/api/stats/top-performance?${q.toString()}`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const err = new Error(data.error || 'Failed to load top performance')
    err.status = res.status
    throw err
  }

  return data
}
