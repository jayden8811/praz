import { NextResponse } from "next/server";
import { findSubscription, summarize } from "@/lib/billing-server";
import { ownerGuard } from "@/lib/owner-server";
import { keyProblem } from "@/lib/stripe-server";
import { admin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

const int = (v: unknown) => Math.max(0, Math.round(Number(v) || 0));
const str = (v: unknown, max = 2000) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const isDay = (v: unknown) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
const DELETABLE = new Set(["positive_replies", "tracked_calls", "client_meetings", "daily_stats"]);

// One client's full record: account, onboarding answers, plan, history, dashboard data, messages.
export async function GET(req: Request) {
  const g = await ownerGuard(req);
  if ("error" in g) return g.error;
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    const db = admin();
    const { data: u, error } = await db.auth.admin.getUserById(id);
    if (error || !u.user) return NextResponse.json({ error: "Client not found" }, { status: 404 });
    const email = u.user.email?.toLowerCase() ?? "";
    const since = new Date(Date.now() - 200 * 86_400_000).toISOString().slice(0, 10);
    const [stats, replies, calls, meetings, settings, messages, events, sub] = await Promise.all([
      db.from("daily_stats").select("*").eq("user_id", id).gte("day", since).order("day", { ascending: false }),
      db.from("positive_replies").select("*").eq("user_id", id).order("received_at", { ascending: false }).limit(100),
      db.from("tracked_calls").select("*").eq("user_id", id).order("called_at", { ascending: false }).limit(100),
      db.from("client_meetings").select("*").eq("user_id", id).order("starts_at", { ascending: false }).limit(100),
      db.from("client_settings").select("*").eq("user_id", id).maybeSingle(),
      db.from("messages").select("*").eq("user_id", id).order("created_at").limit(500),
      db.from("events").select("*").or(`user_id.eq.${id},email.eq.${email}`).order("created_at", { ascending: false }).limit(100),
      keyProblem() ? Promise.resolve(null) : findSubscription(email),
    ]);
    return NextResponse.json({
      user: {
        id,
        email,
        confirmed: !!u.user.email_confirmed_at,
        createdAt: u.user.created_at,
        lastSignInAt: u.user.last_sign_in_at ?? null,
        termsVersion: u.user.user_metadata?.terms_version ?? null,
        termsAcceptedAt: u.user.user_metadata?.terms_accepted_at ?? null,
      },
      setup: u.user.user_metadata?.setup ?? null,
      subscription: sub ? summarize(sub) : null,
      stats: stats.data ?? [],
      replies: replies.data ?? [],
      calls: calls.data ?? [],
      meetings: meetings.data ?? [],
      settings: settings.data ?? null,
      messages: messages.data ?? [],
      events: events.data ?? [],
    });
  } catch (err) {
    console.error("owner client failed", err);
    return NextResponse.json({ error: "Couldn't load this client." }, { status: 500 });
  }
}

// Owner edits to a client's dashboard data.
export async function POST(req: Request) {
  const g = await ownerGuard(req);
  if ("error" in g) return g.error;
  const b = await req.json().catch(() => ({}));
  const userId = str(b.userId, 64);
  if (!userId && b.action !== "delete") return NextResponse.json({ error: "Missing client" }, { status: 400 });
  const db = admin();

  const statRow = (r: Record<string, unknown>) => ({
    user_id: userId,
    day: r.day,
    sent: int(r.sent),
    replies: int(r.replies),
    positive: int(r.positive),
    calls: int(r.calls),
    answered: int(r.answered),
    meetings: int(r.meetings),
  });

  let result;
  switch (b.action) {
    case "stats": {
      if (!isDay(b.day)) return NextResponse.json({ error: "Pick a date." }, { status: 400 });
      result = await db.from("daily_stats").upsert(statRow(b));
      break;
    }
    case "stats_bulk": {
      const rows = Array.isArray(b.rows) ? b.rows.filter((r: Record<string, unknown>) => isDay(r.day)).slice(0, 400) : [];
      if (!rows.length) return NextResponse.json({ error: "No valid rows. Use YYYY-MM-DD dates." }, { status: 400 });
      result = await db.from("daily_stats").upsert(rows.map(statRow));
      break;
    }
    case "reply": {
      if (!str(b.name) || !str(b.message)) return NextResponse.json({ error: "Add a name and the reply." }, { status: 400 });
      result = await db.from("positive_replies").insert({
        user_id: userId,
        name: str(b.name, 200),
        title: str(b.title, 200) || null,
        company: str(b.company, 200) || null,
        message: str(b.message, 4000),
        received_at: b.received_at ? new Date(b.received_at).toISOString() : new Date().toISOString(),
      });
      break;
    }
    case "call": {
      if (!str(b.from_number)) return NextResponse.json({ error: "Add the caller's number." }, { status: 400 });
      result = await db.from("tracked_calls").insert({
        user_id: userId,
        from_number: str(b.from_number, 40),
        location: str(b.location, 120) || null,
        called_at: b.called_at ? new Date(b.called_at).toISOString() : new Date().toISOString(),
        duration_seconds: b.duration_seconds === "" || b.duration_seconds == null ? null : int(b.duration_seconds),
        status: ["Answered", "Missed", "Voicemail"].includes(b.status) ? b.status : "Answered",
      });
      break;
    }
    case "meeting": {
      if (!str(b.name) || !b.starts_at) return NextResponse.json({ error: "Add a name and a time." }, { status: 400 });
      result = await db.from("client_meetings").insert({
        user_id: userId,
        name: str(b.name, 200),
        company: str(b.company, 200) || null,
        starts_at: new Date(b.starts_at).toISOString(),
      });
      break;
    }
    case "settings": {
      result = await db.from("client_settings").upsert({
        user_id: userId,
        operator_name: str(b.operator_name, 120) || null,
        operator_note: str(b.operator_note, 4000) || null,
        campaign_live: !!b.campaign_live,
        updated_at: new Date().toISOString(),
      });
      break;
    }
    case "mark_read": {
      result = await db.from("messages").update({ read_by_owner: true }).eq("user_id", userId).eq("sender", "client");
      break;
    }
    case "delete": {
      if (!DELETABLE.has(b.table)) return NextResponse.json({ error: "Can't delete that." }, { status: 400 });
      result =
        b.table === "daily_stats"
          ? await db.from("daily_stats").delete().eq("user_id", userId).eq("day", b.day)
          : await db.from(b.table).delete().eq("id", str(b.id, 64));
      break;
    }
    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
  if (result.error) {
    console.error("owner edit failed", b.action, result.error);
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
