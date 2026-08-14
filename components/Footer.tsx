import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-semibold mb-3">Mijn Winkel</h3>
            <p className="text-sm text-gray-400">
              Slimme gadgets en handige producten, snel en eenvoudig besteld.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">Klantenservice</h3>
            <ul className="text-sm space-y-2">
              <li>
                <Link href="/garantie" className="hover:text-white">
                  Garantie & Retour
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-white">
                  Mijn account
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">Onze belofte</h3>
            <ul className="text-sm space-y-2 text-gray-400">
              <li>🛡️ 100% tevredenheidsgarantie</li>
              <li>💶 Geld terug binnen 7 dagen</li>
              <li>💳 Veilig betalen via Stripe</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Mijn Winkel. Alle rechten voorbehouden.
        </div>
      </div>
    </footer>
  )
}