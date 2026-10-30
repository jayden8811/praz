import { NextResponse } from "next/server";
import { billingUser } from "@/lib/api-guard";
import { findSubscription, itemPriceFor, volumeOf } from "@/lib/billing-server";
import { pricing, volumes } from "@/lib/site";
import { stripe } from "@/lib/stripe-server";

export const dynamic = "force-dynamic";

// What switching to another daily volume would cost today, before confirming.
export async function POST(req: Request) {
  const auth = await billingUser(req);
  if ("error" in auth) return auth.error;
  const { volume: raw } = await req.json().catch(() => ({}));
  const volume = volumes.find((v) => v === raw);
  if (!volume) return NextResponse.json({ error: "Unknown plan" }, { status: 400 });

  try {
    const sub = await findSubscription(auth.user.email);
    if (!sub) return NextResponse.json({ error: "No active subscription found." }, { status: 404 });
    if (volumeOf(sub) === volume) return NextResponse.json({ error: "You're already on this plan." }, { status: 400 });
    const item = sub.items.data[0];
    const prorationDate = Math.floor(Date.now() / 1000);
    const preview = await stripe().invoices.createPreview({
      customer: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
      subscription: sub.id,
      subscription_details: {
        items: [{ id: item.id, ...(await itemPriceFor(volume)) }],
        proration_behavior: "always_invoice",
        proration_date: prorationDate,
      },
    });
    return NextResponse.json({
      volume,
      monthly: pricing[volume],
      // Positive: charged now. Negative: credited to the next invoices.
      dueNow: preview.amount_due / 100,
      net: preview.total / 100,
      nextRenewal: item.current_period_end,
      prorationDate,
    });
  } catch (err) {
    console.error("billing preview failed", err);
    const e = err as { type?: string; message?: string };
    const detail = e.type?.startsWith("Stripe") && e.message ? ` (Stripe: ${e.message})` : "";
    return NextResponse.json({ error: `Couldn't price that change.${detail}` }, { status: 500 });
  }
}
