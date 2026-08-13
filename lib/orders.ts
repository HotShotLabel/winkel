import db from '@/lib/db'

export interface Product {
  id: string
  name: string
  price: number
  image: string
  description: string
}

export interface Order {
  id: string
  customerEmail: string
  customerName: string
  address: string
  items: { productId: string; name: string; price: number; quantity: number }[]
  total: number
  status: 'pending' | 'paid' | 'shipped'
  trackingCode?: string
  createdAt: string
}

export function getProducts(): Product[] {
  const rows = db.prepare('SELECT * FROM products').all() as any[]
  return rows.map(row => ({
    id: row.id,
    name: row.name,
    price: row.price,
    image: row.image,
    description: row.description,
  }))
}

export function getProduct(id: string): Product | undefined {
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as any | undefined
  if (!row) return undefined
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    image: row.image,
    description: row.description,
  }
}

export function createProduct(product: Omit<Product, 'id'>) {
  const id = Date.now().toString()
  db.prepare('INSERT INTO products (id, name, price, image, description) VALUES (?, ?, ?, ?, ?)').run(
    id, product.name, product.price, product.image, product.description
  )
  return { ...product, id }
}

export function updateProduct(id: string, product: Partial<Product>) {
  const existing = getProduct(id)
  if (!existing) return undefined

  const name = product.name ?? existing.name
  const price = product.price ?? existing.price
  const image = product.image ?? existing.image
  const description = product.description ?? existing.description

  db.prepare('UPDATE products SET name = ?, price = ?, image = ?, description = ? WHERE id = ?').run(
    name, price, image, description, id
  )
  return { ...existing, name, price, image, description }
}

export function deleteProduct(id: string) {
  db.prepare('DELETE FROM products WHERE id = ?').run(id)
}

export function getOrders(): Order[] {
  const rows = db.prepare('SELECT * FROM orders ORDER BY createdAt DESC').all() as any[]
  return rows.map(row => ({
    id: row.id,
    customerEmail: row.customerEmail,
    customerName: row.customerName,
    address: row.address,
    items: JSON.parse(row.items),
    total: row.total,
    status: row.status as Order['status'],
    trackingCode: row.trackingCode || undefined,
    createdAt: row.createdAt,
  }))
}

export function getOrder(id: string): Order | undefined {
  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as any | undefined
  if (!row) return undefined
  return {
    id: row.id,
    customerEmail: row.customerEmail,
    customerName: row.customerName,
    address: row.address,
    items: JSON.parse(row.items),
    total: row.total,
    status: row.status as Order['status'],
    trackingCode: row.trackingCode || undefined,
    createdAt: row.createdAt,
  }
}

export function addOrder(order: Order) {
  db.prepare(`
    INSERT INTO orders (id, customerEmail, customerName, address, items, total, status, trackingCode, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    order.id,
    order.customerEmail,
    order.customerName,
    order.address,
    JSON.stringify(order.items),
    order.total,
    order.status,
    order.trackingCode || '',
    order.createdAt
  )
  return order
}

export function updateOrderTracking(orderId: string, trackingCode: string) {
  db.prepare('UPDATE orders SET trackingCode = ?, status = ? WHERE id = ?').run(trackingCode, 'shipped', orderId)
  const order = getOrder(orderId)
  return order
}
