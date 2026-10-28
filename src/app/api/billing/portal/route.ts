import { NextResponse } from "next/server";
import { billingUser } from "@/lib/api-guard";
import { findSubscription, portalConfiguration } from "@/lib/billing-server";
import { stripe } from "@/lib/stripe-server";

export const dynamic = "force-dynamic";

// A Stripe Billing Portal link for updating the card, downloading invoices, or cancelling.
export async function POST(req: Request) {
  const auth = await billingUser(req);
  if ("error" in auth) return auth.error;
  try {
    const sub = await findSubscription(auth.user.email);
    const customer = sub ? (typeof sub.customer === "string" ? sub.customer : sub.customer.id) : (await stripe().customers.list({ email: auth.user.email, limit: 1 })).data[0]?.id;
    if (!customer) return NextResponse.json({ error: "No billing account found yet." }, { status: 404 });
    const origin = req.headers.get("origin") ?? new URL(req.url).origin;
    const session = await stripe().billingPortal.sessions.create({
      customer,
      configuration: await portalConfiguration(),
      return_url: `${origin}/dashboard#billing`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("billing portal failed", err);
    return NextResponse.json({ error: "Couldn't open billing. Please try again." }, { status: 500 });
  }
}
