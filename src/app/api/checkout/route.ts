import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { volumes } from "@/lib/site";
import { destination, type Setup } from "@/lib/setup";
import { keyProblem, stripe } from "@/lib/stripe-server";
import { findSubscription, planPriceId } from "@/lib/billing-server";

// Creates an embedded Checkout Session for the plan chosen in onboarding,
// and reports a session's status once the client says payment finished.
export const dynamic = "force-dynamic";

// Stripe metadata values are capped at 500 characters.
const clip = (s: string) => s.slice(0, 500);

async function lineItem(volume: (typeof volumes)[number]): Promise<Stripe.Checkout.SessionCreateParams.LineItem> {
  return { price: await planPriceId(volume), quantity: 1 };
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

  // One subscription per client: changes to an existing plan happen in the dashboard.
  const email = /\S+@\S+\.\S+/.test(setup.accountEmail ?? "") ? setup.accountEmail.trim().toLowerCase() : null;
  if (email) {
    try {
      if (await findSubscription(email)) {
        return NextResponse.json(
          { error: "This email already has an active subscription. Log in to your dashboard to change your plan." },
          { status: 409 }
        );
      }
    } catch (err) {
      console.error("checkout duplicate check failed", err);
    }
  }

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
      customer_email: email ?? undefined,
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
