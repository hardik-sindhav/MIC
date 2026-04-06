/**
 * Vite exposes env vars prefixed with VITE_.
 * Default matches backend sample PORT=5000.
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:5000'
