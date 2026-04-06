import { colorChannels } from './colors.js'
import { typography, fontFamilies } from './typography.js'

export const STORAGE_KEY = 'mic-admin-theme'

/** @typedef {'light' | 'dark'} ThemeMode */

export const theme = {
  storageKey: STORAGE_KEY,
  colorChannels,
  typography,
  fontFamilies,
  defaultMode: /** @type {ThemeMode} */ ('light'),
}

export function getPreferredColorScheme() {
  if (typeof window === 'undefined') return theme.defaultMode
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/** @param {ThemeMode} mode */
export function applyThemeClass(mode) {
  const root = document.documentElement
  root.classList.toggle('dark', mode === 'dark')
}
