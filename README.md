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

Each plan's price is found by its Stripe lookup key (`praz_dfy_1000` … `praz_dfy_5000`). The sandbox prices already have them; when you create live prices, give them the same lookup keys. If no matching price exists, checkout uses an inline price with the same amount. The publishable key can be set as `STRIPE_PUBLISHABLE_KEY` (read at request time, no rebuild needed) or `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.

## Accounts (Supabase Auth)

Clients create their login (email + password) on the first onboarding step, log in at `/login`, and can reset a forgotten password from `/forgot-password`. To turn it on:

1. Create a Supabase project and keep **Email** sign-in enabled (Authentication → Providers).
2. Under Authentication → URL Configuration, set the Site URL to your domain and add `https://yourdomain.com/reset-password` and `https://yourdomain.com/dashboard` as redirect URLs.
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to `.env.local` (see `.env.example`).

4. Connect your own email sender under Authentication → Emails → SMTP Settings (for example Resend, Postmark or SendGrid, sending from an address on praz.ai). Supabase's built-in sender only delivers to your own team members' addresses and a few emails per hour, so without this step clients never receive confirmation or password-reset emails.

Until those keys are set, the site uses a stand-in that keeps accounts in the visitor's browser only, so the flow can be previewed. The client's onboarding answers are saved to their account so they reappear when they log in on another device.

## Booking calls (Cal.com)

"Book a Call" opens `/book`, which shows the next 7 days, open times from the Cal.com event `praz-kjqqtj/15min`, and a short details form. The page talks to `/api/booking`, which calls Cal.com's API v2 from the server. Public event types work without a key; to add one, set `CAL_API_KEY` in `.env.local` and in your host's environment variables (it is only read on the server). To use a different event, change `cal` in `src/lib/booking.ts`.

## Plans and billing

The dashboard's **Plan & billing** section shows the client's plan, renewal date and card, and lets them:

- **Change daily volume.** Picking another volume shows what it costs today before confirming. The existing subscription's price is swapped, never a second subscription: unused time on the old plan is credited and only the remaining time on the new plan is charged (upgrades are charged immediately; downgrades leave credit for future invoices). If the charge fails, the plan stays as it was.
- **Manage billing.** Opens Stripe's billing portal to update the card, download invoices, or cancel at the end of the current period.

Subscriptions are matched to logins by email, so the portal doesn't allow changing the billing email. Checkout refuses to start a second subscription for an email that already has one.

## Team notifications

With `RESEND_API_KEY` set, the team inbox (`contact@praz.ai`) receives: each new client's full onboarding answers after payment, setup edits, plan changes, and messages sent from the dashboard (reply-to is the client).
