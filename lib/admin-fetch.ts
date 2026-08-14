'use client'

/**
 * Client-side fetch voor admin-pagina's.
 * Voegt automatisch de admin-wachtwoord-header toe (server-only check).
 */
export function adminFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const password = localStorage.getItem('mijnwinkel_admin_key') || ''
  const headers = new Headers(options.headers)
  if (password) {
    headers.set('x-admin-password', password)
  }
  return fetch(url, { ...options, headers })
}