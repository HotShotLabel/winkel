// Automatische vertaling voor producten (naam + beschrijving).
// Gebruikt Google's gratis vertaal-endpoint; bij een fout valt het terug op de originele tekst.
// Zo is een nieuw product dat in het Nederlands wordt toegevoegd meteen in alle talen zichtbaar.

export const TRANSLATION_LOCALES = ['en', 'fr', 'de', 'es'] as const

async function translateText(text: string, target: string): Promise<string> {
  if (!text) return text
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${target}&dt=t&q=${encodeURIComponent(text)}`
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) })
    if (!res.ok) return text
    const data = await res.json()
    const segments: any[] = data?.[0] || []
    const translated = segments.map((seg: any) => seg?.[0] || '').join('')
    return translated.trim() || text
  } catch (error) {
    console.error(`Translate error (${target}):`, error)
    return text
  }
}

// Vertaalt naam + beschrijving naar alle talen.
// Retourneert bv. { en: { name, description }, fr: { name, description }, ... }
export async function translateProductFields(
  name: string,
  description: string
): Promise<Record<string, { name: string; description: string }>> {
  const result: Record<string, { name: string; description: string }> = {}
  for (const locale of TRANSLATION_LOCALES) {
    const [tName, tDescription] = await Promise.all([
      translateText(name, locale),
      translateText(description, locale),
    ])
    result[locale] = { name: tName, description: tDescription }
  }
  return result
}

// Bouwt de DB-update-objecten voor de vertaalkolommen.
export async function buildTranslationColumns(
  name: string,
  description: string
): Promise<Record<string, string>> {
  const translations = await translateProductFields(name, description)
  const columns: Record<string, string> = {}
  for (const locale of TRANSLATION_LOCALES) {
    columns[`name_${locale}`] = translations[locale].name
    columns[`description_${locale}`] = translations[locale].description
  }
  return columns
}