export type ProductVariant = { label: string; value: string }

// Alleen iPhone producten hebben varianten
const OPTIONS: Record<string, ProductVariant[]> = {
  'iphone-hoesje-magsafe-silicone': [
    { label: 'iPhone 15 Pro / Pro Max', value: 'iphone15' },
    { label: 'iPhone 16 Pro / Pro Max', value: 'iphone16' },
    { label: 'iPhone 17 Pro / Pro Max', value: 'iphone17' },
  ],
  'iphone-gehard-glas-3pack': [
    { label: 'iPhone 15 Pro / Pro Max', value: 'iphone15' },
    { label: 'iPhone 16 Pro / Pro Max', value: 'iphone16' },
    { label: 'iPhone 17 Pro / Pro Max', value: 'iphone17' },
  ],
}

export function getProductOptions(productId: string): ProductVariant[] | null {
  return OPTIONS[productId] ?? null
}

export function getOptionLabel(productId: string, value: string): string {
  const opts = OPTIONS[productId]
  if (!opts) return value
  return opts.find(o => o.value === value)?.label || value
}
