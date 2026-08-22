export type ProductVariant = { label: string; value: string; suffix: string }

const OPTIONS: Record<string, ProductVariant[]> = {
  'iphone-hoesje-magsafe-silicone': [
    { label: 'iPhone 17 Pro Max', value: '17pm', suffix: 'iPhone 17 Pro Max' },
    { label: 'iPhone 17 Pro', value: '17p', suffix: 'iPhone 17 Pro' },
    { label: 'iPhone 17', value: '17', suffix: 'iPhone 17' },
    { label: 'iPhone 16 Pro Max', value: '16pm', suffix: 'iPhone 16 Pro Max' },
    { label: 'iPhone 16 Pro', value: '16p', suffix: 'iPhone 16 Pro' },
    { label: 'iPhone 16', value: '16', suffix: 'iPhone 16' },
    { label: 'iPhone 15 Pro Max', value: '15pm', suffix: 'iPhone 15 Pro Max' },
    { label: 'iPhone 15 Pro', value: '15p', suffix: 'iPhone 15 Pro' },
    { label: 'iPhone 15', value: '15', suffix: 'iPhone 15' },
  ],
  'iphone-gehard-glas-3pack': [
    { label: 'iPhone 17 Pro Max', value: '17pm', suffix: 'iPhone 17 Pro Max' },
    { label: 'iPhone 17 Pro', value: '17p', suffix: 'iPhone 17 Pro' },
    { label: 'iPhone 17', value: '17', suffix: 'iPhone 17' },
    { label: 'iPhone 16 Pro Max', value: '16pm', suffix: 'iPhone 16 Pro Max' },
    { label: 'iPhone 16 Pro', value: '16p', suffix: 'iPhone 16 Pro' },
    { label: 'iPhone 16', value: '16', suffix: 'iPhone 16' },
    { label: 'iPhone 15 Pro Max', value: '15pm', suffix: 'iPhone 15 Pro Max' },
    { label: 'iPhone 15 Pro', value: '15p', suffix: 'iPhone 15 Pro' },
    { label: 'iPhone 15', value: '15', suffix: 'iPhone 15' },
  ],
}

export function getProductOptions(productId: string): ProductVariant[] | null {
  return OPTIONS[productId] ?? null
}

export function getOptionLabel(productId: string, value: string): string {
  const opts = OPTIONS[productId]
  if (!opts) return value
  return opts.find(o => o.value === value)?.suffix || value
}
