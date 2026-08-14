import { NextResponse } from 'next/server'
import { getProducts, createProduct, getProduct, updateProduct, deleteProduct } from '@/lib/orders'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET() {
  const products = await getProducts()
  return NextResponse.json(products)
}

export async function POST(request: Request) {
  try {
    if (!requireAdmin(request)) {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 })
    }
    const productData = await request.json()
    const product = await createProduct(productData)
    if (!product) {
      return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
    }
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
