import { NextResponse } from "next/server";
import { ownerGuard } from "@/lib/owner-server";
import { admin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

// Everything sent to the team through the site: client messages and inbound email to contact@praz.ai.
export async function GET(req: Request) {
  const g = await ownerGuard(req);
  if ("error" in g) return g.error;
  const db = admin();
  const [messages, inbound] = await Promise.all([
    db.from("messages").select("*").eq("sender", "client").order("created_at", { ascending: false }).limit(200),
    db.from("events").select("*").eq("type", "inbound_email").order("created_at", { ascending: false }).limit(200),
  ]);
  return NextResponse.json({ messages: messages.data ?? [], inbound: inbound.data ?? [] });
}
