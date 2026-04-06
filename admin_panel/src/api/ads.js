import { API_BASE_URL } from '../config/env.js'

const ADS_CONFIG = `${API_BASE_URL}/api/ads/config`

export async function fetchAdConfig() {
  const res = await fetch(ADS_CONFIG, {
    headers: { Accept: 'application/json' },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.error || 'Failed to load ad configuration')
    err.status = res.status
    err.details = data.details
    throw err
  }
  return data
}

/**
 * @param {string} accessToken
 * @param {object} body
 */
export async function saveAdConfig(accessToken, body) {
  const res = await fetch(ADS_CONFIG, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.error || 'Failed to save ad configuration')
    err.status = res.status
    err.details = data.details
    throw err
  }
  return data
}
