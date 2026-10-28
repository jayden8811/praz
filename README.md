# Praz

Landing page for Praz — done-for-you outbound for high-ticket B2B.

Next.js 15 · Tailwind v4 · shadcn/ui (new-york) · Motion.

```bash
npm install
npm run dev
```

- Links (book call, checkout, login) and monthly pricing per volume live in `src/lib/site.ts`.
- Sections are in `src/components/sections/` in page order: hero → how it works (animated demo) → ROI → pricing → footer.

## Payments (Stripe)

Onboarding ends with an embedded Stripe Checkout for the chosen plan. To turn it on:

1. Copy `.env.example` to `.env.local` and add your Stripe keys (sandbox keys to start).
2. Run the app as a server (`npm run build && npm start`, or deploy to a Node host such as Vercel), since `/api/checkout` creates the session.

The five monthly prices live in `stripePrices` in `src/lib/site.ts`. They are sandbox prices; create matching live prices and swap the IDs in when you're ready to charge.
