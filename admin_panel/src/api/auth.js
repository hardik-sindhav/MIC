import { API_BASE_URL } from '../config/env.js'

/**
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ accessToken: string, refreshToken: string, tokenType: string, expiresIn: number }>}
 */
export async function loginRequest(credentials) {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
    }),
  })

  let data = {}
  try {
    data = await res.json()
  } catch {
    // non-JSON body
  }

  if (!res.ok) {
    const err = new Error(data.error || 'Sign in failed')
    err.status = res.status
    err.code = data.code
    throw err
  }

  return data
}
