import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { pricing, stripeLookupKey, volumes } from "@/lib/site";
import { destination, type Setup } from "@/lib/setup";
import { keyProblem, stripe } from "@/lib/stripe-server";

// Creates an embedded Checkout Session for the plan chosen in onboarding,
// and reports a session's status once the client says payment finished.
export const dynamic = "force-dynamic";

// Stripe metadata values are capped at 500 characters.
const clip = (s: string) => s.slice(0, 500);

/**
 * The plan's price, found by lookup key so the same code works in any Stripe
 * account or mode. If that account has no such price yet, the price is defined
 * inline so checkout still works.
 */
async function lineItem(volume: (typeof volumes)[number]): Promise<Stripe.Checkout.SessionCreateParams.LineItem> {
  const found = await stripe().prices.list({ lookup_keys: [stripeLookupKey(volume)], active: true, limit: 1 });
  if (found.data[0]) return { price: found.data[0].id, quantity: 1 };
  console.warn(`stripe: no price with lookup key ${stripeLookupKey(volume)}; using an inline price`);
  return {
    quantity: 1,
    price_data: {
      currency: "usd",
      unit_amount: pricing[volume] * 100,
      recurring: { interval: "month" },
      product_data: { name: `Praz Done-For-You Outbound · ${volume.toLocaleString("en-US")}/day` },
    },
  };
}

export async function POST(req: Request) {
  const problem = keyProblem();
  if (problem) {
    console.error("stripe config:", problem);
    return NextResponse.json({ error: "Payments aren't set up yet. Please contact us to finish signing up." }, { status: 503 });
  }

  let setup: Setup;
  try {
    setup = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const volume = volumes.find((v) => v === setup.dailyVolume);
  if (!volume) return NextResponse.json({ error: "Unknown plan" }, { status: 400 });

  const metadata = {
    daily_volume: String(volume),
    company: clip(setup.company ?? ""),
    website: clip(setup.website ?? ""),
    goal: setup.goal ?? "",
    destination: clip(destination(setup) ?? ""),
    icp: clip(setup.icp ?? ""),
    copy_approval: setup.approval ?? "",
    terms_version: setup.termsVersion ?? "",
    terms_accepted_at: setup.termsAcceptedAt ?? "",
  };

  try {
    const session = await stripe().checkout.sessions.create({
      mode: "subscription",
      ui_mode: "embedded_page",
      redirect_on_completion: "never",
      line_items: [await lineItem(volume)],
      customer_email: /\S+@\S+\.\S+/.test(setup.accountEmail ?? "") ? setup.accountEmail : undefined,
      metadata,
      subscription_data: { metadata },
      branding_settings: {
        display_name: "Praz",
        background_color: "#18181b",
        button_color: "#fafafa",
        border_style: "rounded",
      },
    });
    return NextResponse.json({ clientSecret: session.client_secret, sessionId: session.id });
  } catch (err) {
    console.error("checkout session create failed", err);
    return NextResponse.json({ error: "Couldn't start checkout. Please refresh and try again." }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("session_id");
  if (!id) return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  if (keyProblem()) return NextResponse.json({ error: "Payments aren't set up yet." }, { status: 503 });
  try {
    const session = await stripe().checkout.sessions.retrieve(id);
    return NextResponse.json({ status: session.status, paymentStatus: session.payment_status });
  } catch (err) {
    console.error("checkout session retrieve failed", err);
    return NextResponse.json({ error: "Couldn't check payment status." }, { status: 500 });
  }
}
