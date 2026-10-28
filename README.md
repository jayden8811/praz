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

## Accounts (Supabase Auth)

Clients create their login (email + password) on the first onboarding step, log in at `/login`, and can reset a forgotten password from `/forgot-password`. To turn it on:

1. Create a Supabase project and keep **Email** sign-in enabled (Authentication → Providers).
2. Under Authentication → URL Configuration, set the Site URL to your domain and add `https://yourdomain.com/reset-password` and `https://yourdomain.com/dashboard` as redirect URLs.
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to `.env.local` (see `.env.example`).

Until those keys are set, the site uses a stand-in that keeps accounts in the visitor's browser only, so the flow can be previewed. The client's onboarding answers are saved to their account so they reappear when they log in on another device.

## Booking calls (Cal.com)

"Book a Call" opens `/book`, which shows the next 7 days, open times from the Cal.com event `praz-kjqqtj/15min`, and a short details form. The page talks to `/api/booking`, which calls Cal.com's API v2 from the server. Public event types work without a key; to add one, set `CAL_API_KEY` in `.env.local` and in your host's environment variables (it is only read on the server). To use a different event, change `cal` in `src/lib/booking.ts`.
