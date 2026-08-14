import { NextRequest } from 'next/server'

/**
 * Server-side admin check voor API-routes.
 * Vereist header `x-admin-password` die overeenkomt met env ADMIN_PASSWORD.
 */
export function requireAdmin(request: NextRequest | Request): boolean {
  const password = process.env.ADMIN_PASSWORD
  if (!password) {
    console.error('ADMIN_PASSWORD env niet ingesteld — admin API geblokkeerd')
    return false
  }
  const header = (request as Request).headers.get('x-admin-password')
  return header === password
}