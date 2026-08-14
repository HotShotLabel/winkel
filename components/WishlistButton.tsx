'use client'

import { useWishlist } from '@/components/Wishlist'

export default function WishlistButton({
  productId,
  className = '',
  showLabel = false,
}: {
  productId: string
  className?: string
  showLabel?: boolean
}) {
  const { has, toggle } = useWishlist()
  const active = has(productId)

  return (
    <button
      type="button"
      aria-label={active ? 'Verwijder uit verlanglijst' : 'Bewaar op verlanglijst'}
      aria-pressed={active}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggle(productId)
      }}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full transition-colors ${
        active
          ? 'bg-red-50 text-red-600'
          : 'bg-white text-gray-400 hover:text-red-500 hover:bg-red-50'
      } ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {showLabel && (
        <span className="text-sm font-medium">
          {active ? 'Op verlanglijst' : 'Bewaren'}
        </span>
      )}
    </button>
  )
}
