export type CategoryId = 'zomer' | 'verwarming' | 'gadgets' | 'sfeer' | 'gezin' | 'wellness'

export const CATEGORIES: { id: CategoryId; emoji: string }[] = [
  { id: 'zomer', emoji: '🌊' },
  { id: 'verwarming', emoji: '🧣' },
  { id: 'gadgets', emoji: '🎧' },
  { id: 'sfeer', emoji: '💡' },
  { id: 'gezin', emoji: '⛺' },
  { id: 'wellness', emoji: '🧖' },
]

const MAP: Record<string, CategoryId> = {
  'draagbare-campingventilator-20000mah-met-led-lamp': 'zomer',
  'draagbare-luchtkoeler-6l-verdampend': 'zomer',
  'draagbare-nekventilator-8000mah-bladloos': 'zomer',
  'pcm-koelhalsband-herbruikbaar': 'zomer',
  'coolify-3-nek-airconditioner': 'zomer',
  '3-in-1-mistkoelventilator': 'zomer',
  'gobi-heat-breeze-koelvest': 'zomer',
  'dreo-turbocool-misting-fan': 'zomer',
  'elektrisch-verwarmde-handschoenen-3-standen': 'verwarming',
  'elektrische-deken-180x130cm-met-timer': 'verwarming',
  'magnetische-handwarmer-2-in-1': 'verwarming',
  'verwarmde-sokken-met-5000mah-batterij': 'verwarming',
  'warmtekruik-met-zachte-pluche-hoes': 'verwarming',
  'essager-powerbank-65w': 'gadgets',
  'kz-edx-pro-x': 'gadgets',
  'laxasfit-h9-pro-max': 'gadgets',
  'magcubic-hy300-pro': 'gadgets',
  'magsafe-3in1': 'gadgets',
  'noodradio-lototg': 'gadgets',
  'usb-c-240w-kabel': 'gadgets',
  'led-strip-app': 'sfeer',
  'star-projector': 'sfeer',
  'opblaasbaar-familiezwembad-verdikt-pvc': 'gezin',
  'spin-scrubber': 'wellness',
}

export function productCategory(id: string): CategoryId | null {
  return MAP[id] ?? null
}