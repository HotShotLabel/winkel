# 1Place4All - Dropshipping Store

Gratis Next.js winkel met Stripe betalingen.

## Setup

1. Installeer dependencies:
```bash
npm install
```

2. Haal Stripe test keys op van https://dashboard.stripe.com/test/apikeys

3. Vul `.env.local` in met je Stripe keys:
```
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

4. Start development server:
```bash
npm run dev
```

5. Ga naar http://localhost:3000

## Admin

Ga naar http://localhost:3000/admin (wachtwoord: admin123)

## Producten bewerken

Bewerk `lib/orders.ts` om producten toe te voegen/veranderen.

## Live gaan

1. Vergeet niet om `.env.local` aan te passen voor productie
2. Deploy naar Vercel (1-click vanuit GitHub)
3. Zet Stripe webhook op je live URL: https://jouwdomein.nl/api/webhook
// trigger redeploy
