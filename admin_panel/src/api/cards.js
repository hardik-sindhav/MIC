import { API_BASE_URL } from '../config/env.js'

export async function fetchCards(accessToken) {
  const res = await fetch(`${API_BASE_URL}/api/cards`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.error || 'Failed to load cards')
    err.status = res.status
    err.details = data.details
    throw err
  }
  return data
}

/**
 * @param {string} accessToken
 * @param {FormData} formData - FormData with 'image' file and other fields
 */
export async function createCard(accessToken, formData) {
  const res = await fetch(`${API_BASE_URL}/api/cards`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(
      data.error ||
        (res.status === 413 ? 'File too large. Use an image under 10 MB.' : 'Failed to create card'),
    )
    err.status = res.status
    err.code = data.code || (res.status === 413 ? 'PAYLOAD_TOO_LARGE' : undefined)
    err.details = data.details
    throw err
  }
  return data
}

/**
 * @param {string} accessToken
 * @param {string} id
 * @param {FormData} formData - FormData with optional 'image' file and other fields
 */
export async function updateCard(accessToken, id, formData) {
  const res = await fetch(`${API_BASE_URL}/api/cards/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(
      data.error ||
        (res.status === 413 ? 'File too large. Use an image under 10 MB.' : 'Failed to update card'),
    )
    err.status = res.status
    err.code = data.code || (res.status === 413 ? 'PAYLOAD_TOO_LARGE' : undefined)
    err.details = data.details
    throw err
  }
  return data
}

/**
 * @param {string} accessToken
 * @param {string} id
 */
export async function deleteCard(accessToken, id) {
  const res = await fetch(`${API_BASE_URL}/api/cards/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.error || 'Failed to archive card')
    err.status = res.status
    throw err
  }
  return data
}

export async function permanentDeleteCardApi(accessToken, id) {
  const res = await fetch(`${API_BASE_URL}/api/cards/${encodeURIComponent(id)}/permanent`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.error || 'Failed to permanently delete card')
    err.status = res.status
    throw err
  }
  return data
}

export async function fetchDeletedCards(accessToken) {
  const res = await fetch(`${API_BASE_URL}/api/cards/deleted`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.error || 'Failed to load archived cards')
    err.status = res.status
    throw err
  }
  return data
}

export async function restoreCardApi(accessToken, id) {
  const res = await fetch(`${API_BASE_URL}/api/cards/${encodeURIComponent(id)}/restore`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.error || 'Failed to restore card')
    err.status = res.status
    throw err
  }
  return data
}
