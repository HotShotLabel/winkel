import { getSupabase } from '@/lib/supabase'

export interface Product {
  id: string
  name: string
  price: number
  image: string
  description: string
  created_at?: string
}

export interface Order {
  id: string
  customer_email: string
  customer_name: string
  address: string
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

export async function createProduct(product: Omit<Product, 'id' | 'created_at'>): Promise<Product | null> {
  const { data, error } = await getSupabase()
    .from('products')
    .insert(product)
    .select()
    .single()

  if (error) {
    console.error('Error creating product:', error)
    return null
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
