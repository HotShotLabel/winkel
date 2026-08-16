import { getSupabase } from '@/lib/supabase'
import { buildTranslationColumns } from '@/lib/translate'

export interface Product {
  id: string
  name: string
  price: number
  image: string
  description: string
  number?: number
  created_at?: string
  name_en?: string
  name_fr?: string
  name_de?: string
  name_es?: string
  description_en?: string
  description_fr?: string
  description_de?: string
  description_es?: string
}

// Kiest naam/beschrijving per taal, valt terug op Nederlands
export function localizeProduct(product: Product, locale: string): Product {
  if (locale === 'nl') return product
  const key = locale as 'en' | 'fr' | 'de' | 'es'
  const name = product[`name_${key}`] || product.name
  const description = product[`description_${key}`] || product.description
  return { ...product, name, description }
}

export interface Order {
  id: string
  customer_email: string
  customer_name: string
  address: string
  address_map?: string // JSON: {countryCode, province, locationTreeAddressId, phoneCountry, mobileNo}
  items: { productId: string; name: string; price: number; quantity: number }[]
  total: number
  status: 'pending' | 'paid' | 'shipped'
  tracking_code?: string
  created_at: string
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await getSupabase()
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }
  return data || []
}

export async function getProduct(id: string): Promise<Product | null> {
  const { data, error } = await getSupabase()
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching product:', error)
    return null
  }
  return data
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export async function createProduct(product: Omit<Product, 'id' | 'created_at'>): Promise<Product | null> {
  // De products-tabel heeft id als NOT NULL zonder default.
  // Genereer een unieke slug uit de naam (zoals bestaande producten: star-projector, usb-c-240w-kabel).
  const baseSlug = slugify(product.name) || 'product'
  let slug = baseSlug
  let suffix = 2
  for (;;) {
    const { data: existing } = await getSupabase()
      .from('products')
      .select('id')
      .eq('id', slug)
      .maybeSingle()
    if (!existing) break
    slug = `${baseSlug}-${suffix}`
    suffix++
  }

  const { data, error } = await getSupabase()
    .from('products')
    .insert({ ...product, id: slug })
    .select()
    .single()

  if (error) {
    console.error('Error creating product:', error)
    return null
  }

  // Nieuw product direct vertalen naar alle talen (valt terug op NL bij een fout)
  try {
    const translations = await buildTranslationColumns(product.name, product.description || '')
    await getSupabase()
      .from('products')
      .update(translations)
      .eq('id', data.id)
    return { ...data, ...translations }
  } catch (e) {
    console.error('Auto-translate create error:', e)
  }

  return data
}

export async function updateProduct(id: string, product: Partial<Product>): Promise<Product | null> {
  const { data, error } = await getSupabase()
    .from('products')
    .update(product)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating product:', error)
    return null
  }

  // Bij naam-/beschrijvingswijziging ook de vertalingen bijwerken
  if (product.name !== undefined || product.description !== undefined) {
    try {
      const current = await getProduct(id)
      if (current) {
        const translations = await buildTranslationColumns(
          current.name,
          current.description || ''
        )
        await getSupabase()
          .from('products')
          .update(translations)
          .eq('id', id)
        return { ...current, ...translations }
      }
    } catch (e) {
      console.error('Auto-translate update error:', e)
    }
  }

  return data
}

export async function deleteProduct(id: string): Promise<boolean> {
  const { error } = await getSupabase()
    .from('products')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting product:', error)
    return false
  }
  return true
}

export async function getOrders(): Promise<Order[]> {
  const { data, error } = await getSupabase()
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching orders:', error)
    return []
  }
  return data || []
}

// Social proof: aantal verkochte exemplaren per product (alleen betaalde/verzonden bestellingen).
export async function getPaidOrderCounts(): Promise<Record<string, number>> {
  const { data, error } = await getSupabase()
    .from('orders')
    .select('status, items')

  if (error) {
    console.error('Error fetching order counts:', error)
    return {}
  }

  const counts: Record<string, number> = {}
  for (const order of data || []) {
    if (order.status === 'pending') continue
    for (const item of (order.items as { productId: string; quantity: number }[]) || []) {
      if (!item?.productId) continue
      counts[item.productId] = (counts[item.productId] || 0) + (item.quantity || 1)
    }
  }
  return counts
}

export async function getOrdersByEmail(email: string): Promise<Order[]> {
  const { data, error } = await getSupabase()
    .from('orders')
    .select('*')
    .eq('customer_email', email)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching orders by email:', error)
    return []
  }
  return data || []
}

export async function getOrder(id: string): Promise<Order | null> {
  const { data, error } = await getSupabase()
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching order:', error)
    return null
  }
  return data
}

export async function addOrder(order: Omit<Order, 'id' | 'created_at'> & { id: string }): Promise<Order | null> {
  const { data, error } = await getSupabase()
    .from('orders')
    .insert({
      ...order,
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding order:', error)
    return null
  }
  return data
}

export async function updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
  const { data, error } = await getSupabase()
    .from('orders')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating order:', error)
    return null
  }
  return data
}

export async function updateOrderTracking(orderId: string, trackingCode: string): Promise<Order | null> {
  const { data, error } = await getSupabase()
    .from('orders')
    .update({ tracking_code: trackingCode, status: 'shipped' })
    .eq('id', orderId)
    .select()
    .single()

  if (error) {
    console.error('Error updating order tracking:', error)
    return null
  }
  return data
}
