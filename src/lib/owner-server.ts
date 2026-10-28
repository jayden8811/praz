import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { summarize } from "@/lib/billing-server";
import { keyProblem, stripe } from "@/lib/stripe-server";
import { adminConfigured, verifiedOwner } from "@/lib/supabase-admin";

/** Owner-only guard for /api/owner routes. */
export async function ownerGuard(req: Request) {
  if (!adminConfigured()) {
    return { error: NextResponse.json({ error: "Add SUPABASE_SECRET_KEY to the site's environment to use the owner suite." }, { status: 503 }) };
  }
  const owner = await verifiedOwner(req);
  if (!owner) return { error: NextResponse.json({ error: "Not authorized." }, { status: 403 }) };
  return { owner };
}

const RANK: Record<string, number> = { active: 5, trialing: 4, past_due: 3, unpaid: 2, incomplete: 1, canceled: 0 };

/** Every client's most relevant subscription, keyed by lowercase email. */
export async function subscriptionsByEmail() {
  const map = new Map<string, ReturnType<typeof summarize> & { created: number }>();
  if (keyProblem()) return map;
  let starting_after: string | undefined;
  for (let i = 0; i < 20; i++) {
    const page: Stripe.ApiList<Stripe.Subscription> = await stripe().subscriptions.list({
      status: "all",
      limit: 100,
      expand: ["data.customer", "data.default_payment_method"],
      ...(starting_after ? { starting_after } : {}),
    });
    for (const sub of page.data) {
      const c = sub.customer as Stripe.Customer | Stripe.DeletedCustomer;
      const email = "email" in c && c.email ? c.email.toLowerCase() : null;
      if (!email) continue;
      const prev = map.get(email);
      const better = !prev || (RANK[sub.status] ?? 0) > (RANK[prev.status] ?? 0) || ((RANK[sub.status] ?? 0) === (RANK[prev.status] ?? 0) && sub.created > prev.created);
      if (better) map.set(email, { ...summarize(sub), created: sub.created });
    }
    if (!page.has_more) break;
    starting_after = page.data[page.data.length - 1]?.id;
  }
  return map;
}
