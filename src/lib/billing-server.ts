import type Stripe from "stripe";
import { pricing, stripeLookupKey, volumes, type Volume } from "@/lib/site";
import { stripe } from "@/lib/stripe-server";

// Server-only helpers for finding and changing a client's Praz subscription.

// "incomplete" is left out: an unfinished first payment shouldn't block trying again.
const LIVE_STATUSES: Stripe.Subscription.Status[] = ["active", "trialing", "past_due", "unpaid"];

/** The client's current Praz subscription, found through the Stripe customers that share their login email. */
export async function findSubscription(email: string) {
  // Stripe matches emails case-sensitively; we create customers with lowercase emails.
  const lower = email.trim().toLowerCase();
  const lists = await Promise.all(
    [...new Set([lower, email.trim()])].map((e) => stripe().customers.list({ email: e, limit: 10 }))
  );
  const customers = { data: lists.flatMap((l) => l.data) };
  let best: Stripe.Subscription | null = null;
  for (const c of customers.data) {
    const subs = await stripe().subscriptions.list({ customer: c.id, status: "all", limit: 10, expand: ["data.default_payment_method"] });
    for (const s of subs.data) {
      if (!LIVE_STATUSES.includes(s.status)) continue;
      // Prefer active ones, then the most recent.
      if (!best || (s.status === "active" && best.status !== "active") || (s.status === best.status && s.created > best.created)) best = s;
    }
  }
  return best;
}

/** Daily volume a subscription is on, from its price's lookup key, metadata, or amount. */
export function volumeOf(sub: Stripe.Subscription): Volume | null {
  const price = sub.items.data[0]?.price;
  const fromKey = price?.lookup_key?.match(/^praz_dfy_(\d+)$/)?.[1];
  const candidates = [fromKey, sub.metadata?.daily_volume, price?.metadata?.daily_volume].map(Number);
  for (const c of candidates) {
    const v = volumes.find((x) => x === c);
    if (v) return v;
  }
  const byAmount = volumes.find((v) => pricing[v] * 100 === price?.unit_amount);
  return byAmount ?? null;
}

/** The price to switch to: the plan's lookup-key price, or an inline price on the same product. */
export async function itemPriceFor(volume: Volume, current: Stripe.SubscriptionItem) {
  const found = await stripe().prices.list({ lookup_keys: [stripeLookupKey(volume)], active: true, limit: 1 });
  if (found.data[0]) return { price: found.data[0].id };
  const product = typeof current.price.product === "string" ? current.price.product : current.price.product.id;
  return {
    price_data: {
      currency: "usd",
      product,
      unit_amount: pricing[volume] * 100,
      recurring: { interval: "month" as const },
    },
  };
}

export function summarize(sub: Stripe.Subscription) {
  const item = sub.items.data[0];
  const pm = sub.default_payment_method && typeof sub.default_payment_method !== "string" ? sub.default_payment_method : null;
  return {
    id: sub.id,
    status: sub.status,
    volume: volumeOf(sub),
    amount: (item?.price.unit_amount ?? 0) / 100,
    currentPeriodEnd: item?.current_period_end ?? null,
    cancelAtPeriodEnd: sub.cancel_at_period_end,
    cancelAt: sub.cancel_at,
    card: pm?.card ? { brand: pm.card.brand, last4: pm.card.last4 } : null,
    pendingUpdate: !!sub.pending_update,
  };
}

/** A Billing Portal configuration for payment methods, invoices, and cancelling at period end. */
export async function portalConfiguration() {
  const existing = await stripe().billingPortal.configurations.list({ active: true, limit: 10 });
  const ours = existing.data.find((c) => c.metadata?.praz === "1");
  if (ours) return ours.id;
  const created = await stripe().billingPortal.configurations.create({
    metadata: { praz: "1" },
    business_profile: {
      headline: "Manage your Praz subscription",
      privacy_policy_url: "https://praz.ai/privacy",
      terms_of_service_url: "https://praz.ai/terms",
    },
    features: {
      payment_method_update: { enabled: true },
      invoice_history: { enabled: true },
      // Email stays fixed: subscriptions are matched to logins by email.
      customer_update: { enabled: true, allowed_updates: ["address", "name", "tax_id"] },
      // Plan changes happen in the Praz dashboard so the operator's setup stays in sync.
      subscription_update: { enabled: false },
      subscription_cancel: {
        enabled: true,
        mode: "at_period_end",
        cancellation_reason: {
          enabled: true,
          options: ["too_expensive", "missing_features", "switched_service", "unused", "other"],
        },
      },
    },
  });
  return created.id;
}
