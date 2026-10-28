import { NextResponse } from "next/server";
import { describeSetup, notifyTeam } from "@/lib/notify";
import { keyProblem, stripe } from "@/lib/stripe-server";
import { admin, logEvent, userByEmail } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

// After payment: confirms the Checkout Session is paid and sends the new client's
// full onboarding answers to the team, once per subscription.
export async function POST(req: Request) {
  if (keyProblem()) return NextResponse.json({ error: "Payments aren't set up yet." }, { status: 503 });
  const body = await req.json().catch(() => ({}));
  if (typeof body.sessionId !== "string") return NextResponse.json({ error: "Missing session" }, { status: 400 });

  try {
    const session = await stripe().checkout.sessions.retrieve(body.sessionId);
    if (session.status !== "complete") return NextResponse.json({ status: session.status });
    const subId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
    if (subId) {
      const sub = await stripe().subscriptions.retrieve(subId);
      if (sub.metadata?.team_notified !== "1") {
        const email = session.customer_details?.email ?? body.setup?.accountEmail ?? null;
        const user = email ? await userByEmail(email).catch(() => null) : null;
        await logEvent({
          userId: user?.id,
          email,
          type: "subscribed",
          detail: { subscription: subId, amount: (session.amount_total ?? 0) / 100, volume: sub.metadata?.daily_volume, setup: body.setup ?? null },
        });
        // Keep the full onboarding answers on the account so they show in the owner suite.
        if (user && body.setup && !user.user_metadata?.setup) {
          await admin().auth.admin.updateUserById(user.id, { user_metadata: { ...user.user_metadata, setup: body.setup } });
        }
        const sent = await notifyTeam({
          subject: `New client: ${session.customer_details?.email ?? body.setup?.accountEmail ?? subId}`,
          text: `A new subscription started.\nSubscription: ${subId}\nAmount: $${((session.amount_total ?? 0) / 100).toLocaleString("en-US")}/mo\n\n${describeSetup(body.setup ?? {})}`,
          replyTo: session.customer_details?.email ?? undefined,
        });
        if (sent) await stripe().subscriptions.update(subId, { metadata: { team_notified: "1" } });
      }
    }
    return NextResponse.json({ status: "complete" });
  } catch (err) {
    console.error("checkout complete failed", err);
    return NextResponse.json({ error: "Couldn't confirm your payment yet." }, { status: 500 });
  }
}
