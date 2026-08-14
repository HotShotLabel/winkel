'use client'

import { useState, useEffect } from 'react'
import { Product } from '@/lib/orders'
import { AliExpressSources } from '@/lib/aliexpress'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [sources, setSources] = useState<AliExpressSources>({})
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: '',
    description: '',
    aliexpress_url: '',
    aliexpress_sku: ''
  })
  const [imageFile, setImageFile] = useState<File | null>(null)

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error('Failed to fetch products:', err))
    fetch('/api/aliexpress-sources')
      .then(res => res.json())
      .then(data => setSources(data))
      .catch(err => console.error('Failed to fetch aliexpress sources:', err))
  }, [])

  const saveSources = async (next: AliExpressSources) => {
    setSources(next)
    await fetch('/api/aliexpress-sources', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(next),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const productData = {
      name: formData.name,
      price: parseFloat(formData.price),
      image: formData.image,
      description: formData.description
    }

    let productId: string | null = null

    if (editingProduct) {
      productId = editingProduct.id
      await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      })
    } else {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      })
      const created = await res.json()
      productId = created?.id || null
    }

    // AliExpress-link opslaan in sources-mapping
    if (productId) {
      const next = { ...sources }
      if (formData.aliexpress_url) {
        next[productId] = { url: formData.aliexpress_url, sku: formData.aliexpress_sku || null }
      } else {
        delete next[productId]
      }
      await saveSources(next)
    }

    setFormData({ name: '', price: '', image: '', description: '', aliexpress_url: '', aliexpress_sku: '' })
    setEditingProduct(null)
    setShowAddForm(false)
    
    // Refresh products
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    const src = sources[product.id]
    setFormData({
      name: product.name,
      price: product.price.toString(),
      image: product.image,
      description: product.description,
      aliexpress_url: src?.url || '',
      aliexpress_sku: src?.sku || ''
    })
    setShowAddForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Weet je zeker dat je dit product wilt verwijderen?')) return
    
    await fetch(`/api/products/${id}`, { method: 'DELETE' })
    setProducts(products.filter(p => p.id !== id))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const resetForm = () => {
    setFormData({ name: '', price: '', image: '', description: '', aliexpress_url: '', aliexpress_sku: '' })
    setEditingProduct(null)
    setShowAddForm(false)
    setImageFile(null)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Producten</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Nieuw product
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingProduct ? 'Product bewerken' : 'Nieuw product toevoegen'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Naam</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prijs (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Afbeelding</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
              />
              {formData.image && !imageFile && (
                <p className="text-sm text-gray-500">Afbeelding URL ingesteld</p>
              )}
              {imageFile && (
                <p className="text-sm text-green-600">Bestand geselecteerd: {imageFile.name}</p>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Beschrijving</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">AliExpress-link (productpagina)</label>
                <input
                  type="url"
                  value={formData.aliexpress_url}
                  onChange={(e) => setFormData({...formData, aliexpress_url: e.target.value})}
                  placeholder="https://nl.aliexpress.com/item/1005009055519135.html"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">AliExpress-variant (skuId, optioneel)</label>
                <input
                  type="text"
                  value={formData.aliexpress_sku}
                  onChange={(e) => setFormData({...formData, aliexpress_sku: e.target.value})}
                  placeholder="bijv. 1200003712345678"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                {editingProduct ? 'Opslaan' : 'Toevoegen'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Annuleren
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Afbeelding</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Naam</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prijs</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Beschrijving</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">AliExpress</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acties</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map(product => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="h-12 w-12 object-cover rounded" />
                  ) : (
                    <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">Geen</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {product.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  €{product.price.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                  {product.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {sources[product.id]?.url ? (
                    <a
                      href={sources[product.id].url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-600 hover:text-orange-800"
                    >
                      Link ↗
                    </a>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Bewerk
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Verwijder
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
