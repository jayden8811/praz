import { NextResponse } from "next/server";
import { billingUser } from "@/lib/api-guard";
import { findSubscription, summarize } from "@/lib/billing-server";

export const dynamic = "force-dynamic";

// The signed-in client's plan, renewal date and card.
export async function GET(req: Request) {
  const auth = await billingUser(req);
  if ("error" in auth) return auth.error;
  try {
    const sub = await findSubscription(auth.user.email);
    return NextResponse.json({ subscription: sub ? summarize(sub) : null });
  } catch (err) {
    console.error("billing summary failed", err);
    return NextResponse.json({ error: "Couldn't load your plan." }, { status: 500 });
  }
}
