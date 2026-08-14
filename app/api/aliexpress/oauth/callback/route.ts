import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

// OAuth-callback voor AliExpress Open Platform.
// AliExpress stuurt de gebruiker hierheen met ?code=... na autorisatie.
// We slaan de code op in Supabase Storage; de token-uitwisseling gebeurt
// in een aparte stap (app/api/aliexpress/token/route.ts) zodra app_key/secret bekend zijn.

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')

  if (!code) {
    return new NextResponse(
      '<html><body style="font-family:sans-serif;padding:40px"><h2>Geen code ontvangen</h2><p>De AliExpress-autorisatie gaf geen code terug. Sluit dit tabblad.</p></body></html>',
      { headers: { 'Content-Type': 'text/html' } }
    )
  }

  // Code opslaan in Storage (tokens.json) voor de token-stap
  const supabase = getSupabase()
  const { error } = await supabase.storage
    .from('app-data')
    .upload('aliexpress-oauth-code.json', JSON.stringify({
      code,
      state: state || null,
      received_at: new Date().toISOString(),
    }), { contentType: 'application/json', upsert: true })

  if (error) {
    console.error('Error saving oauth code:', error)
  }

  return new NextResponse(
    `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:40px;text-align:center">
      <h2 style="color:#16a34a">✅ Autorisatie ontvangen</h2>
      <p>De AliExpress-koppeling is geregistreerd. Je kunt dit tabblad sluiten.</p>
    </body></html>`,
    { headers: { 'Content-Type': 'text/html' } }
  )
}