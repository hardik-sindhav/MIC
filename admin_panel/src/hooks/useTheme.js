import { useCallback, useEffect, useState } from 'react'
import { applyThemeClass, getPreferredColorScheme, STORAGE_KEY } from '../styles/theme.js'

/**
 * Persists light/dark preference and syncs the `dark` class on <html>.
 * @returns {{ theme: 'light' | 'dark', setTheme: (m: 'light' | 'dark') => void, toggleTheme: () => void }}
 */
export function useTheme() {
  const [theme, setThemeState] = useState(() => {
    if (typeof window === 'undefined') return 'light'
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
    return getPreferredColorScheme()
  })

  const setTheme = useCallback((mode) => {
    setThemeState(mode)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((t) => (t === 'dark' ? 'light' : 'dark'))
  }, [])

  useEffect(() => {
    applyThemeClass(theme)
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  return { theme, setTheme, toggleTheme }
}
