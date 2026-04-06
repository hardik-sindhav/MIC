/**
 * MIC Admin — semantic color tokens (matches src/index.css).
 */

export const colorChannels = {
  light: {
    accent: '8 145 178',
    accentFg: '255 255 255',
    primary: '24 24 27',
    primaryFg: '250 250 250',
    primaryMuted: '113 113 122',
    secondary: '63 63 70',
    secondaryFg: '250 250 250',
    success: '22 101 52',
    error: '185 28 28',
    surface: '255 255 255',
    surfaceElevated: '255 255 255',
    surfaceMuted: '244 244 245',
    border: '228 228 231',
    borderStrong: '212 212 216',
    fg: '24 24 27',
    fgMuted: '63 63 70',
    fgSubtle: '113 113 122',
  },
  dark: {
    accent: '34 211 238',
    accentFg: '9 9 11',
    primary: '250 250 250',
    primaryFg: '24 24 27',
    primaryMuted: '161 161 170',
    secondary: '212 212 216',
    secondaryFg: '24 24 27',
    success: '74 222 128',
    error: '248 113 113',
    surface: '9 9 11',
    surfaceElevated: '24 24 27',
    surfaceMuted: '39 39 42',
    border: '39 39 42',
    borderStrong: '63 63 70',
    fg: '250 250 250',
    fgMuted: '161 161 170',
    fgSubtle: '113 113 122',
  },
}

/** @param {'light' | 'dark'} mode */
export function rgb(mode, token) {
  const ch = colorChannels[mode][token]
  return ch ? `rgb(${ch.replace(/ /g, ', ')})` : undefined
}
