import { getProducts } from '@/lib/orders'
import ProductCard from '@/components/ProductCard'

export default async function Home() {
  const products = getProducts()
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welkom bij Onze Winkel
        </h1>
        <p className="text-xl text-gray-600">
          Snel bestellen, direct bezorgd
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
