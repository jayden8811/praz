import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripePrices, volumes } from "@/lib/site";
import { destination, type Setup } from "@/lib/setup";

// Creates an embedded Checkout Session for the plan chosen in onboarding,
// and reports a session's status once the client says payment finished.

function stripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key);
}

// Stripe metadata values are capped at 500 characters.
const clip = (s: string) => s.slice(0, 500);

export async function POST(req: Request) {
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
  };

  try {
    const session = await stripe().checkout.sessions.create({
      mode: "subscription",
      ui_mode: "embedded_page",
      redirect_on_completion: "never",
      line_items: [{ price: stripePrices[volume], quantity: 1 }],
      customer_email: /\S+@\S+\.\S+/.test(setup.email ?? "") ? setup.email : undefined,
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
    return NextResponse.json({ error: "Couldn't start checkout. Please try again." }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("session_id");
  if (!id) return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  try {
    const session = await stripe().checkout.sessions.retrieve(id);
    return NextResponse.json({ status: session.status, paymentStatus: session.payment_status });
  } catch (err) {
    console.error("checkout session retrieve failed", err);
    return NextResponse.json({ error: "Couldn't check payment status." }, { status: 500 });
  }
}
