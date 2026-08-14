import Link from 'next/link'

export const metadata = {
  title: 'Garantie & Retour | Onze Winkel',
}

export default function GarantiePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Garantie & Retour</h1>
      <p className="text-gray-600 mb-8">100% tevredenheidsgarantie — niet goed, geld terug.</p>

      <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold text-green-800 mb-2">
          🛡️ 100% tevredenheidsgarantie
        </h2>
        <p className="text-green-700">
          Wij staan voor onze producten. Ben je niet tevreden met je aankoop?
          Dan krijg je je geld terug binnen 7 dagen na ontvangst van je pakket.
          Geen ingewikkelde procedures, geen gedoe.
        </p>
      </div>

      <h2 className="text-xl font-semibold text-gray-900 mb-3">Voorwaarden</h2>
      <p className="text-gray-600 mb-4">
        Om gebruik te kunnen maken van de garantie gelden de volgende voorwaarden:
      </p>
      <ul className="list-disc list-inside text-gray-700 space-y-2 mb-8">
        <li>Je meldt je retour <strong>binnen 7 dagen</strong> na ontvangst van het pakket.</li>
        <li>Het pakket is <strong>niet geopend</strong>.</li>
        <li>Het product is <strong>niet beschadigd</strong> en verkeert in originele staat.</li>
        <li>Het product wordt teruggestuurd in de originele verpakking.</li>
      </ul>

      <h2 className="text-xl font-semibold text-gray-900 mb-3">Hoe werkt het?</h2>
      <ol className="list-decimal list-inside text-gray-700 space-y-2 mb-8">
        <li>Neem contact met ons op via de contactgegevens hieronder.</li>
        <li>Vermeld je bestelnummer en de reden van retour.</li>
        <li>Wij sturen je de retourinstructies.</li>
        <li>Na ontvangst en controle van het retourpakket ontvang je je geld terug binnen 5 werkdagen.</li>
      </ol>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Contact</h2>
        <p className="text-gray-600 mb-1">
          Vragen of een retour melden? Neem contact met ons op:
        </p>
        <p className="text-gray-700">
          📧 <a href="mailto:info@onzewinkel.nl" className="text-blue-600 hover:underline">info@onzewinkel.nl</a>
        </p>
      </div>

      <Link href="/" className="text-blue-600 hover:underline">
        ← Terug naar de winkel
      </Link>
    </div>
  )
}