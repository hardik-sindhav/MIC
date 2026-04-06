import { API_BASE_URL } from '../config/env.js'

const SHOP_CHESTS = `${API_BASE_URL}/api/shop/treasure-chests`

export async function fetchShopCheats(accessToken) {
  const res = await fetch(SHOP_CHESTS, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.error || 'Failed to load treasure chests')
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
export async function createShopCheat(accessToken, body) {
  const res = await fetch(SHOP_CHESTS, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.error || 'Failed to create treasure chest')
    err.status = res.status
    err.details = data.details
    throw err
  }
  return data
}

/**
 * @param {string} accessToken
 * @param {string} id
 * @param {object} body
 */
export async function updateShopCheat(accessToken, id, body) {
  const res = await fetch(`${SHOP_CHESTS}/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.error || 'Failed to update treasure chest')
    err.status = res.status
    err.details = data.details
    throw err
  }
  return data
}

/**
 * @param {string} accessToken
 * @param {string} id
 */
export async function deleteShopCheat(accessToken, id) {
  const res = await fetch(`${SHOP_CHESTS}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.error || 'Failed to delete treasure chest')
    err.status = res.status
    throw err
  }
  return data
}
