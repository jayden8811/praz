import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/notify";
import { ownerGuard } from "@/lib/owner-server";
import { admin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

// The operator's reply: shows in the client's dashboard thread and is emailed to them.
export async function POST(req: Request) {
  const g = await ownerGuard(req);
  if ("error" in g) return g.error;
  const { userId, body } = await req.json().catch(() => ({}));
  const text = typeof body === "string" ? body.trim().slice(0, 5000) : "";
  if (!userId || !text) return NextResponse.json({ error: "Write a reply first." }, { status: 400 });

  const db = admin();
  const { data: u } = await db.auth.admin.getUserById(userId);
  if (!u?.user?.email) return NextResponse.json({ error: "Client not found" }, { status: 404 });
  const { data, error } = await db.from("messages").insert({ user_id: userId, sender: "operator", body: text }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await db.from("messages").update({ read_by_owner: true }).eq("user_id", userId).eq("sender", "client");

  const emailed = await sendEmail({
    to: u.user.email,
    subject: "New message from your Praz operator",
    text: `${text}\n\n—\nReply in your dashboard: https://praz.ai/dashboard`,
    replyTo: process.env.TEAM_EMAIL || "contact@praz.ai",
  });
  return NextResponse.json({ message: data, emailed });
}
