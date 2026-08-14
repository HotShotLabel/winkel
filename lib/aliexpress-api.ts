import crypto from 'crypto'
import { getSupabase } from './supabase'

/**
 * AliExpress Open Platform API client (Dropshipping API).
 *
 * - Signing: HMAC-SHA256 over gesorteerde key+value paren (geen prefix),
 *   hex UPPERCASE, key = app_secret.
 * - System-level API calls (token create/refresh) gaan naar /rest en hebben
 *   WEL een prefix in de sign-string.
 * - Business API calls gaan naar /sync en hebben GEEN prefix.
 *
 * Tokens worden opgeslagen in Supabase Storage (app-data/aliexpress-tokens.json)
 * omdat refresh-tokens bij elke refresh veranderen en gedeeld moeten worden
 * tussen lokale dev en Vercel.
 */

const SYNC_URL = 'https://api-sg.aliexpress.com/sync'
const REST_URL = 'https://api-sg.aliexpress.com/rest'
const STORAGE_BUCKET = 'app-data'
const TOKENS_FILE = 'aliexpress-tokens.json'

export interface AliExpressTokens {
  access_token: string
  refresh_token: string
  expires_in: number        // seconden geldig
  refresh_expires_in: number // seconden geldig
  expire_time: number       // epoch ms
  refresh_token_valid_time: number // epoch ms
  user_id?: string
  seller_id?: string
  account?: string
  updated_at: string
}

export function getAppCredentials(): { appKey: string; appSecret: string } {
  const appKey = process.env.ALIEXPRESS_APP_KEY
  const appSecret = process.env.ALIEXPRESS_APP_SECRET
  if (!appKey || !appSecret) {
    throw new Error('ALIEXPRESS_APP_KEY / ALIEXPRESS_APP_SECRET ontbreken')
  }
  return { appKey, appSecret }
}

export async function getTokens(): Promise<AliExpressTokens> {
  // Eerst opslag checken (meest actueel na refresh), daarna env als fallback
  const supabase = getSupabase()
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .download(TOKENS_FILE)

  if (!error && data) {
    try {
      const parsed = JSON.parse(await data.text()) as AliExpressTokens
      if (parsed.access_token) return parsed
    } catch {
      // fall through naar env
    }
  }

  if (process.env.ALIEXPRESS_ACCESS_TOKEN && process.env.ALIEXPRESS_REFRESH_TOKEN) {
    return {
      access_token: process.env.ALIEXPRESS_ACCESS_TOKEN,
      refresh_token: process.env.ALIEXPRESS_REFRESH_TOKEN,
      expires_in: 86400,
      refresh_expires_in: 172800,
      expire_time: Date.now() + 86400 * 1000,
      refresh_token_valid_time: Date.now() + 172800 * 1000,
      updated_at: new Date().toISOString(),
    }
  }

  throw new Error('Geen AliExpress tokens gevonden (storage noch env)')
}

export async function saveTokens(tokens: AliExpressTokens): Promise<void> {
  const supabase = getSupabase()
  await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(TOKENS_FILE, JSON.stringify(tokens), {
      contentType: 'application/json',
      upsert: true,
    })
}

function signParams(params: Record<string, string>, appSecret: string, prefix = ''): string {
  const sortedKeys = Object.keys(params).sort()
  const signString = prefix + sortedKeys.map((k) => k + params[k]).join('')
  return crypto
    .createHmac('sha256', appSecret)
    .update(signString, 'utf8')
    .digest('hex')
    .toUpperCase()
}

async function postJson(url: string, body: Record<string, string>): Promise<any> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error(`AliExpress HTTP ${res.status}`)
  }
  return res.json()
}

/** Ververs de tokens via /auth/token/refresh (system-level, /rest, met prefix) */
export async function refreshTokens(): Promise<AliExpressTokens> {
  const { appKey, appSecret } = getAppCredentials()
  const current = await getTokens()

  const params: Record<string, string> = {
    app_key: appKey,
    app_secret: appSecret,
    refresh_token: current.refresh_token,
    sign_method: 'sha256',
    timestamp: String(Date.now()),
  }
  params.sign = signParams(params, appSecret, '/auth/token/refresh')

  const json = await postJson(`${REST_URL}/auth/token/refresh`, params)
  if (json.error_response) {
    throw new Error(`Token refresh mislukt: ${json.error_response.code} ${json.error_response.msg}`)
  }

  const tokens: AliExpressTokens = {
    access_token: json.access_token,
    refresh_token: json.refresh_token,
    expires_in: Number(json.expires_in ?? 86400),
    refresh_expires_in: Number(json.refresh_expires_in ?? 172800),
    expire_time: Number(json.expire_time ?? Date.now() + 86400 * 1000),
    refresh_token_valid_time: Number(json.refresh_token_valid_time ?? Date.now() + 172800 * 1000),
    user_id: json.user_id,
    seller_id: json.seller_id,
    account: json.account,
    updated_at: new Date().toISOString(),
  }
  await saveTokens(tokens)
  return tokens
}

/** Zorgt dat een geldige access_token beschikbaar is (refresht automatisch indien nodig) */
export async function ensureValidAccessToken(): Promise<string> {
  let tokens = await getTokens()
  // 5 min marge
  if (tokens.expire_time - Date.now() < 5 * 60 * 1000) {
    try {
      tokens = await refreshTokens()
    } catch (e) {
      console.error('Auto-refresh mislukt:', e)
      // Fallback: probeer met oude token, API geeft dan duidelijke fout
    }
  }
  return tokens.access_token
}

/** Roep een business API aan (aliexpress.ds.*) via /sync */
export async function callApi(
  method: string,
  apiParams: Record<string, string | number> = {}
): Promise<any> {
  const { appKey, appSecret } = getAppCredentials()
  const accessToken = await ensureValidAccessToken()

  const params: Record<string, string> = {
    method,
    app_key: appKey,
    access_token: accessToken,
    sign_method: 'sha256',
    timestamp: String(Date.now()),
    ...Object.fromEntries(
      Object.entries(apiParams).map(([k, v]) => [k, String(v)])
    ),
  }
  params.sign = signParams(params, appSecret)

  const json = await postJson(SYNC_URL, params)
  if (json.error_response) {
    const err = json.error_response
    throw new Error(`AliExpress ${method}: ${err.code} ${err.msg}`)
  }
  return json
}

/** Helper: eerste response-waarde (bijv. aliexpress_ds_product_get_response) */
export function unwrapResponse(json: any): any {
  const key = Object.keys(json).find((k) => k.endsWith('_response'))
  if (!key) return json
  return json[key]
}
