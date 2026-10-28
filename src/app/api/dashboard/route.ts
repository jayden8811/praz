import { NextResponse } from "next/server";
import { verifiedUser } from "@/lib/server-auth";
import { admin, adminConfigured } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

// Everything the signed-in client's dashboard shows, entered by the owner.
export async function GET(req: Request) {
  const user = await verifiedUser(req);
  if (!user) return NextResponse.json({ error: "Please log in again." }, { status: 401 });
  if (!adminConfigured()) return NextResponse.json({ error: "Dashboard data isn't connected yet." }, { status: 503 });

  const since = new Date(Date.now() - 200 * 86_400_000).toISOString().slice(0, 10);
  const db = admin();
  const [stats, replies, calls, meetings, settings] = await Promise.all([
    db.from("daily_stats").select("*").eq("user_id", user.id).gte("day", since).order("day"),
    db.from("positive_replies").select("*").eq("user_id", user.id).order("received_at", { ascending: false }).limit(20),
    db.from("tracked_calls").select("*").eq("user_id", user.id).order("called_at", { ascending: false }).limit(20),
    db.from("client_meetings").select("*").eq("user_id", user.id).gte("starts_at", new Date(Date.now() - 3_600_000).toISOString()).order("starts_at").limit(20),
    db.from("client_settings").select("*").eq("user_id", user.id).maybeSingle(),
  ]);
  const failed = [stats, replies, calls, meetings, settings].find((r) => r.error);
  if (failed) {
    console.error("dashboard data failed", failed.error);
    return NextResponse.json({ error: "Couldn't load your data." }, { status: 500 });
  }
  return NextResponse.json({
    stats: stats.data,
    replies: replies.data,
    calls: calls.data,
    meetings: meetings.data,
    settings: settings.data,
  });
}
