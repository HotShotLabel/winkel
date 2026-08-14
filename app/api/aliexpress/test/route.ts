import { NextResponse } from 'next/server'
import { callApi, unwrapResponse } from '@/lib/aliexpress-api'

// Test-endpoint voor de AliExpress API (alleen voor verificatie)
// GET /api/aliexpress/test?keyword=led+strip

export async function GET(request: Request) {
  const url = new URL(request.url)
  const keyword = url.searchParams.get('keyword') || 'led strip'
  const productId = url.searchParams.get('product_id')

  try {
    if (productId) {
      const json = await callApi('aliexpress.ds.product.get', {
        product_id: productId,
        ship_to_country: 'NL',
        target_currency: 'EUR',
        target_language: 'nl',
      })
      const resp = unwrapResponse(json)
      const result = resp?.result || {}
      const skus = result.ae_item_sku_info_dtos?.ae_item_sku_info_d_t_o || []
      return NextResponse.json({
        ok: true,
        subject: result.subject,
        skuCount: skus.length,
        skus: skus.slice(0, 5).map((s: any) => ({
          sku_id: s.sku_id,
          price: s.sku_price,
          currency: s.currency_code,
          stock: s.sku_available_stock,
          attrs: s.sku_attr,
        })),
      })
    }

    const json = await callApi('aliexpress.ds.text.search', {
      keyWord: keyword,
      local: 'nl_NL',
      countryCode: 'NL',
      currency: 'EUR',
      pageSize: 5,
      pageIndex: 1,
    })
    const resp = unwrapResponse(json)
    const products = resp?.data?.products?.selection_search_product || []
    return NextResponse.json({
      ok: true,
      totalCount: resp?.data?.totalCount,
      products: products.map((p: any) => ({
        itemId: p.itemId,
        title: p.title,
        price: p.salePriceFormat,
        orders: p.orders,
        score: p.score,
      })),
    })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}