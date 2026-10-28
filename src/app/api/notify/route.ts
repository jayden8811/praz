import { NextResponse } from "next/server";
import { verifiedUser } from "@/lib/server-auth";
import { describeSetup, notifyTeam } from "@/lib/notify";

export const dynamic = "force-dynamic";

// Signed-in clients messaging their operator, or telling them about a setup change.
export async function POST(req: Request) {
  const user = await verifiedUser(req);
  if (!user) return NextResponse.json({ error: "Please log in again." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const text = typeof body.text === "string" ? body.text.trim().slice(0, 5000) : "";

  let sent = false;
  if (body.kind === "message" && text) {
    sent = await notifyTeam({ subject: `Message from ${user.email}`, text, replyTo: user.email });
  } else if (body.kind === "setup" && body.setup && typeof body.setup === "object") {
    sent = await notifyTeam({
      subject: `Setup change: ${user.email}`,
      text: `${user.email} updated their setup in the dashboard.\n\n${describeSetup(body.setup)}`,
      replyTo: user.email,
    });
  } else {
    return NextResponse.json({ error: "Nothing to send." }, { status: 400 });
  }
  if (!sent) return NextResponse.json({ error: "Couldn't send right now." }, { status: 502 });
  return NextResponse.json({ ok: true });
}
