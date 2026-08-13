import { NextResponse } from 'next/server'
import { getProducts, createProduct, getProduct, updateProduct, deleteProduct } from '@/lib/orders'

export async function GET() {
  const products = await getProducts()
  return NextResponse.json(products)
}

export async function POST(request: Request) {
  try {
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
