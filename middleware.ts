import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Skip API routes, admin, Next.js internals en bestanden met extensie
  matcher: ['/((?!api|admin|_next|_vercel|.*\\..*).*)'],
}