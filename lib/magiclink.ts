import crypto from 'crypto'

const SECRET = process.env.MAGIC_LINK_SECRET || 'dev-secret-change-me'

const MAGIC_LINK_TTL = 60 * 60 * 1000 // 1 uur
const SESSION_TTL = 7 * 24 * 60 * 60 * 1000 // 7 dagen

export interface MagicToken {
  email: string
  exp: number
}

function sign(payload: MagicToken): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = crypto.createHmac('sha256', SECRET).update(data).digest('base64url')
  return `${data}.${sig}`
}

function verify(token: string): MagicToken | null {
  try {
    const [data, sig] = token.split('.')
    if (!data || !sig) return null

    const expected = crypto.createHmac('sha256', SECRET).update(data).digest('base64url')
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null

    const payload = JSON.parse(Buffer.from(data, 'base64url').toString()) as MagicToken
    if (!payload.email || !payload.exp) return null
    if (Date.now() > payload.exp) return null

    return payload
  } catch {
    return null
  }
}

/** Magic link token: kort geldig, bedoeld voor 1 e-mailklik */
export function createMagicLinkToken(email: string): string {
  return sign({ email: email.trim().toLowerCase(), exp: Date.now() + MAGIC_LINK_TTL })
}

/** Sessie-token: langer geldig, bewaard in localStorage */
export function createSessionToken(email: string): string {
  return sign({ email: email.trim().toLowerCase(), exp: Date.now() + SESSION_TTL })
}

export function verifyToken(token: string): MagicToken | null {
  return verify(token)
}
