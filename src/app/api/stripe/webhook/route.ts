import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { volumeOf } from "@/lib/billing-server";
import { notifyTeam } from "@/lib/notify";
import { stripe } from "@/lib/stripe-server";
import { logEvent, userByEmail } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

// Stripe tells us about subscription changes made anywhere, including
// cancellations in the billing portal and failed renewals. Add this endpoint in
// Stripe → Developers → Webhooks and set STRIPE_WEBHOOK_SECRET.
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(raw, req.headers.get("stripe-signature") ?? "", secret);
  } catch {
    return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  }

  const emailFor = async (customer: string | Stripe.Customer | Stripe.DeletedCustomer | null) => {
    if (!customer) return null;
    const c = typeof customer === "string" ? await stripe().customers.retrieve(customer) : customer;
    return "deleted" in c && c.deleted ? null : (c as Stripe.Customer).email;
  };

  try {
    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;
      const prev = (event.data.previous_attributes ?? {}) as Partial<Stripe.Subscription>;
      const email = await emailFor(sub.customer);
      const user = email ? await userByEmail(email).catch(() => null) : null;
      let type: string | null = null;
      if (event.type === "customer.subscription.deleted") type = "subscription_ended";
      else if (prev.cancel_at_period_end === false && sub.cancel_at_period_end) type = "cancellation_scheduled";
      else if (prev.cancel_at_period_end === true && !sub.cancel_at_period_end) type = "cancellation_reversed";
      else if (prev.status && prev.status !== sub.status) type = `status_${sub.status}`;
      if (type) {
        await logEvent({ userId: user?.id, email, type, detail: { subscription: sub.id, volume: volumeOf(sub), status: sub.status } });
        if (type === "cancellation_scheduled" || type === "subscription_ended" || type === "status_past_due") {
          await notifyTeam({ subject: `${type.replace(/_/g, " ")}: ${email ?? sub.id}`, text: `Subscription ${sub.id} for ${email ?? "unknown"}: ${type.replace(/_/g, " ")}.` });
        }
      }
    } else if (event.type === "invoice.payment_failed") {
      const inv = event.data.object as Stripe.Invoice;
      const email = inv.customer_email ?? (await emailFor(inv.customer));
      await logEvent({ email, type: "payment_failed", detail: { invoice: inv.id, amount: inv.amount_due / 100 } });
      await notifyTeam({ subject: `Payment failed: ${email ?? inv.id}`, text: `Invoice ${inv.id} for $${inv.amount_due / 100} failed.` });
    }
  } catch (err) {
    console.error("stripe webhook handling failed", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}
