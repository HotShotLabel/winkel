// Vaste productnummers (1-20), zelfde volgorde als de cataloguslijst.
// Wordt getoond op kaarten, productpagina en admin — zodat bezoeker/beheerder
// per nummer kan verwijzen ("foto van nr 12").
const PRODUCT_ORDER = [
  'draagbare-campingventilator-20000mah-met-led-lamp',
  'draagbare-luchtkoeler-6l-verdampend',
  'draagbare-nekventilator-8000mah-bladloos',
  'elektrisch-verwarmde-handschoenen-3-standen',
  'elektrische-deken-180x130cm-met-timer',
  'essager-powerbank-65w',
  'kz-edx-pro-x',
  'laxasfit-h9-pro-max',
  'led-strip-app',
  'magcubic-hy300-pro',
  'magnetische-handwarmer-2-in-1',
  'magsafe-3in1',
  'noodradio-lototg',
  'opblaasbaar-familiezwembad-verdikt-pvc',
  'pcm-koelhalsband-herbruikbaar',
  'spin-scrubber',
  'star-projector',
  'usb-c-240w-kabel',
  'verwarmde-sokken-met-5000mah-batterij',
  'warmtekruik-met-zachte-pluche-hoes',
] as const

const NUMBER_BY_ID: Record<string, number> = Object.fromEntries(
  PRODUCT_ORDER.map((id, i) => [id, i + 1])
)

export function getProductNumber(id: string): number | null {
  return NUMBER_BY_ID[id] ?? null
}