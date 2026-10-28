import { NextResponse } from "next/server";
import { verifiedUser } from "@/lib/server-auth";
import { admin, adminConfigured } from "@/lib/supabase-admin";
import { notifyTeam } from "@/lib/notify";

export const dynamic = "force-dynamic";

// The signed-in client's thread with their operator.
export async function GET(req: Request) {
  const user = await verifiedUser(req);
  if (!user) return NextResponse.json({ error: "Please log in again." }, { status: 401 });
  if (!adminConfigured()) return NextResponse.json({ messages: [] });
  const { data, error } = await admin()
    .from("messages")
    .select("id, sender, body, created_at")
    .eq("user_id", user.id)
    .order("created_at")
    .limit(200);
  if (error) return NextResponse.json({ error: "Couldn't load messages." }, { status: 500 });
  return NextResponse.json({ messages: data });
}

export async function POST(req: Request) {
  const user = await verifiedUser(req);
  if (!user) return NextResponse.json({ error: "Please log in again." }, { status: 401 });
  const { body } = await req.json().catch(() => ({}));
  const text = typeof body === "string" ? body.trim().slice(0, 5000) : "";
  if (!text) return NextResponse.json({ error: "Write a message first." }, { status: 400 });

  let saved = null;
  if (adminConfigured()) {
    const { data, error } = await admin()
      .from("messages")
      .insert({ user_id: user.id, sender: "client", body: text })
      .select("id, sender, body, created_at")
      .single();
    if (error) console.error("message insert failed", error);
    saved = data;
  }
  const emailed = await notifyTeam({ subject: `Message from ${user.email}`, text, replyTo: user.email });
  if (!saved && !emailed) return NextResponse.json({ error: "Couldn't send right now." }, { status: 502 });
  return NextResponse.json({ message: saved ?? { id: `local-${Date.now()}`, sender: "client", body: text, created_at: new Date().toISOString() } });
}
