import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { billingUser } from "@/lib/api-guard";
import { findSubscription, itemPriceFor, summarize, volumeOf } from "@/lib/billing-server";
import { notifyTeam } from "@/lib/notify";
import { volumes } from "@/lib/site";
import { stripe } from "@/lib/stripe-server";
import { logEvent } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

// Moves the client's existing subscription to another daily volume. The same
// subscription is updated (never a second one): unused time on the old price is
// credited and only the remaining time on the new price is charged.
export async function POST(req: Request) {
  const auth = await billingUser(req);
  if ("error" in auth) return auth.error;
  const body = await req.json().catch(() => ({}));
  const volume = volumes.find((v) => v === body.volume);
  if (!volume) return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  const prorationDate = Number.isInteger(body.prorationDate) ? body.prorationDate : undefined;

  try {
    const sub = await findSubscription(auth.user.email);
    if (!sub) return NextResponse.json({ error: "No active subscription found." }, { status: 404 });
    if (sub.status !== "active" && sub.status !== "trialing") {
      return NextResponse.json({ error: "Update your payment method before changing plans." }, { status: 409 });
    }
    const from = volumeOf(sub);
    if (from === volume) return NextResponse.json({ error: "You're already on this plan." }, { status: 400 });
    const item = sub.items.data[0];

    const updated = await stripe().subscriptions.update(sub.id, {
      items: [{ id: item.id, ...(await itemPriceFor(volume)) }],
      proration_behavior: "always_invoice",
      // Keep the price shown in the preview.
      ...(prorationDate ? { proration_date: prorationDate } : {}),
      // If the prorated charge fails, the plan stays as it was.
      payment_behavior: "pending_if_incomplete",
      metadata: { ...sub.metadata, daily_volume: String(volume) },
      expand: ["latest_invoice", "default_payment_method"],
    });

    if (updated.pending_update) {
      const invoice = updated.latest_invoice as Stripe.Invoice | null;
      return NextResponse.json(
        {
          error: "Your card couldn't be charged, so your plan hasn't changed.",
          payUrl: invoice?.hosted_invoice_url ?? null,
        },
        { status: 402 }
      );
    }

    await logEvent({
      userId: auth.user.id,
      email: auth.user.email,
      type: from !== null && volume > from ? "plan_upgraded" : "plan_downgraded",
      detail: { from, to: volume, subscription: sub.id },
    });
    await notifyTeam({
      subject: `Plan change: ${auth.user.email} ${from ?? "?"} → ${volume}/day`,
      text: `${auth.user.email} changed their daily volume from ${from ?? "unknown"} to ${volume} emails per day.\nSubscription: ${sub.id}`,
      replyTo: auth.user.email,
    });
    return NextResponse.json({ subscription: summarize(updated) });
  } catch (err) {
    console.error("billing change failed", err);
    const message = (err as { type?: string; message?: string })?.type === "StripeCardError"
      ? "Your card was declined, so your plan hasn't changed."
      : "Couldn't change your plan. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
