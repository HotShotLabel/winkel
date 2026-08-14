import { callApi, unwrapResponse } from './aliexpress-api'
import { getSupabase } from './supabase'

/**
 * AliExpress placeorder voor klantorders.
 *
 * Flow per betaalde order:
 * 1. freight query per product -> logistics_service_name
 * 2. aliexpress.ds.order.create met klantadres (address_map uit checkout)
 *
 * Adresvereisten (getest aug 2026):
 * - country: 2-letter code (NL, BE, DE, FR)
 * - province: Engelse naam ("South Holland")
 * - zip: zonder spaties
 * - location_tree_address_id: `<land>-<provincie>` codes uit lib/address-map.ts
 * - mobile_no + phone_country verplicht
 */

const STORAGE_BUCKET = 'app-data'
const SOURCES_FILE = 'aliexpress-sources.json'
const ORDERS_FILE = 'aliexpress-orders.json'
const ADDRESSES_FILE = 'order-addresses.json'

/** Klantadres per winkel-order (JSON string), opgeslagen in Storage */
let addressesCache: Record<string, string> | null = null

export async function getOrderAddresses(): Promise<Record<string, string>> {
  if (addressesCache) return addressesCache
  const supabase = getSupabase()
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .download(ADDRESSES_FILE)
  let parsed: Record<string, string> = {}
  if (!error && data) {
    try {
      parsed = JSON.parse(await data.text())
    } catch {
      parsed = {}
    }
  }
  addressesCache = parsed
  return parsed
}

export async function saveOrderAddress(shopOrderId: string, addressMapJson: string): Promise<void> {
  const addresses = await getOrderAddresses()
  addresses[shopOrderId] = addressMapJson
  const supabase = getSupabase()
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(ADDRESSES_FILE, JSON.stringify(addresses, null, 2), {
      contentType: 'application/json',
      upsert: true,
    })
  if (error) {
    throw new Error(`Adres opslaan mislukt: ${error.message}`)
  }
}

/** Koppeling winkel-order -> AliExpress-order, opgeslagen in Storage (geen DB-migratie nodig) */
export interface AliexpressOrderLink {
  orderId: string // AliExpress order id
  placedAt: string
  status: 'placed' | 'failed'
  error?: string
}

let ordersCache: Record<string, AliexpressOrderLink> | null = null

export async function getAliexpressOrderLinks(): Promise<Record<string, AliexpressOrderLink>> {
  if (ordersCache) return ordersCache
  const supabase = getSupabase()
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .download(ORDERS_FILE)
  let parsed: Record<string, AliexpressOrderLink> = {}
  if (!error && data) {
    try {
      parsed = JSON.parse(await data.text())
    } catch {
      parsed = {}
    }
  }
  ordersCache = parsed
  return parsed
}

export async function saveAliexpressOrderLink(
  shopOrderId: string,
  link: AliexpressOrderLink
): Promise<void> {
  const links = await getAliexpressOrderLinks()
  links[shopOrderId] = link
  const supabase = getSupabase()
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(ORDERS_FILE, JSON.stringify(links, null, 2), {
      contentType: 'application/json',
      upsert: true,
    })
  if (error) {
    throw new Error(`Koppeling opslaan mislukt: ${error.message}`)
  }
}

export interface ProductSource {
  url: string
  productId: number
  skuId: string
  skuAttr: string
  skuPrice: string
  skuStock: number
}

export interface AddressMap {
  countryCode: string
  province: string
  locationTreeAddressId: string
  phoneCountry: string
  mobileNo: string
}

let sourcesCache: Record<string, ProductSource> | null = null

export async function getProductSources(): Promise<Record<string, ProductSource>> {
  if (sourcesCache) return sourcesCache
  const supabase = getSupabase()
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .download(SOURCES_FILE)
  if (error || !data) {
    throw new Error(`Product sources niet gevonden: ${error?.message || 'geen data'}`)
  }
  const parsed = JSON.parse(await data.text()) as Record<string, ProductSource>
  sourcesCache = parsed
  return parsed
}

/** Freight-optie ophalen voor een product naar een land -> logistics_service_name */
export async function getFreightOption(
  productId: number,
  skuId: string,
  shipToCountry: string,
  quantity = 1
): Promise<string> {
  const res = await callApi('aliexpress.ds.freight.query', {
    queryDeliveryReq: JSON.stringify({
      quantity,
      shipToCountry,
      productId,
      selectedSkuId: skuId,
      language: 'en_US',
      currency: 'EUR',
      locale: 'en_US',
    }),
  })
  const r = unwrapResponse(res)
  const options = r.result?.delivery_options?.delivery_option_d_t_o || []
  if (!options.length) {
    throw new Error(`Geen verzendopties voor product ${productId} naar ${shipToCountry}`)
  }
  // Eerste optie (CAINIAO_FULFILLMENT_PRE in tests)
  return options[0].code || options[0].logistics_service_name
}

export interface PlaceOrderItem {
  productId: number
  skuAttr: string
  quantity: number
  logisticsServiceName: string
}

export interface PlaceOrderResult {
  orderId: string
  raw: any
}

/** Plaats een AliExpress-order op het klantadres */
export async function placeOrder(
  address: AddressMap,
  items: PlaceOrderItem[],
  customerName: string,
  city: string,
  zip: string,
  street: string,
  outOrderId?: string
): Promise<PlaceOrderResult> {
  const request = {
    logistics_address: {
      address: street,
      city,
      province: address.province,
      contact_person: customerName,
      full_name: customerName,
      country: address.countryCode,
      zip,
      mobile_no: address.mobileNo,
      phone_country: address.phoneCountry,
      locale: 'en_US',
      location_tree_address_id: address.locationTreeAddressId,
    },
    product_items: items.map((it) => ({
      product_id: it.productId,
      product_count: it.quantity,
      sku_attr: it.skuAttr,
      logistics_service_name: it.logisticsServiceName,
      order_memo: '',
    })),
  }

  const params: Record<string, string> = {
    param_place_order_request4_open_api_d_t_o: JSON.stringify(request),
  }
  if (outOrderId) {
    params.out_order_id = outOrderId
  }
  // try_to_pay false = order onbetaald laten (veilig testen); true = direct betalen
  params.ds_extend_request = JSON.stringify({
    payment: { try_to_pay: 'false', pay_currency: 'USD' },
  })

  const res = await callApi('aliexpress.ds.order.create', params)
  const r = unwrapResponse(res)
  const result = r.result || r
  if (result.is_success !== true) {
    throw new Error(`Placeorder mislukt: ${JSON.stringify(result).slice(0, 500)}`)
  }
  const orderId = result.order_list?.number?.[0] || result.order_id
  if (!orderId) {
    throw new Error(`Placeorder zonder order-id: ${JSON.stringify(result).slice(0, 500)}`)
  }
  return { orderId: String(orderId), raw: result }
}