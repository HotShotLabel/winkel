import { NextResponse } from 'next/server'
import { getProducts, createProduct, getProduct, updateProduct, deleteProduct } from '@/lib/orders'

export async function GET() {
  const products = getProducts()
  return NextResponse.json(products)
}

export async function POST(request: Request) {
  try {
    const productData = await request.json()
    const product = createProduct(productData)
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
