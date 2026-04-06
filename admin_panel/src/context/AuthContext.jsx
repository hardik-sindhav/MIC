import { useCallback, useMemo, useState } from 'react'
import { AuthContext } from './auth-context.js'

const STORAGE_ACCESS = 'mic_access_token'
const STORAGE_REFRESH = 'mic_refresh_token'

function readStoredTokens() {
  try {
    const accessToken = localStorage.getItem(STORAGE_ACCESS) || ''
    const refreshToken = localStorage.getItem(STORAGE_REFRESH) || ''
    if (!accessToken) return null
    return { accessToken, refreshToken }
  } catch {
    return null
  }
}

function persistTokens(accessToken, refreshToken) {
  localStorage.setItem(STORAGE_ACCESS, accessToken)
  if (refreshToken) localStorage.setItem(STORAGE_REFRESH, refreshToken)
}

function clearStoredTokens() {
  localStorage.removeItem(STORAGE_ACCESS)
  localStorage.removeItem(STORAGE_REFRESH)
}

export function AuthProvider({ children }) {
  const [tokens, setTokens] = useState(readStoredTokens)

  const login = useCallback((payload) => {
    const { accessToken, refreshToken } = payload
    persistTokens(accessToken, refreshToken || '')
    setTokens({ accessToken, refreshToken: refreshToken || '' })
  }, [])

  const logout = useCallback(() => {
    clearStoredTokens()
    setTokens(null)
  }, [])

  const value = useMemo(
    () => ({
      accessToken: tokens?.accessToken ?? null,
      refreshToken: tokens?.refreshToken ?? null,
      isAuthenticated: Boolean(tokens?.accessToken),
      login,
      logout,
    }),
    [tokens, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
