import { NextResponse } from 'next/server'
import { getProduct, updateProduct, deleteProduct } from '@/lib/orders'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const product = await getProduct(params.id)
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }
  return NextResponse.json(product)
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!requireAdmin(request)) {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 })
    }
    const productData = await request.json()
    const product = await updateProduct(params.id, productData)
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 })
  }
  const success = await deleteProduct(params.id)
  if (!success) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }
  return NextResponse.json({ success: true })
}
