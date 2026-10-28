import { NextResponse } from "next/server";
import { ownerGuard, subscriptionsByEmail } from "@/lib/owner-server";
import { admin, ownerEmails } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

// All clients with their plan and status, plus recent activity and unread messages.
export async function GET(req: Request) {
  const g = await ownerGuard(req);
  if ("error" in g) return g.error;
  try {
    const db = admin();
    const users = [];
    for (let page = 1; page <= 20; page++) {
      const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
      if (error) throw error;
      users.push(...data.users);
      if (data.users.length < 200) break;
    }
    const [subs, unread, events] = await Promise.all([
      subscriptionsByEmail(),
      db.from("messages").select("user_id").eq("sender", "client").eq("read_by_owner", false),
      db.from("events").select("*").order("created_at", { ascending: false }).limit(50),
    ]);
    const unreadBy = new Map<string, number>();
    for (const m of unread.data ?? []) unreadBy.set(m.user_id, (unreadBy.get(m.user_id) ?? 0) + 1);
    const owners = new Set(ownerEmails());

    const clients = users
      .filter((u) => u.email && !owners.has(u.email.toLowerCase()))
      .map((u) => {
        const setup = (u.user_metadata?.setup ?? {}) as Record<string, unknown>;
        const email = u.email!.toLowerCase();
        return {
          id: u.id,
          email,
          confirmed: !!u.email_confirmed_at,
          createdAt: u.created_at,
          lastSignInAt: u.last_sign_in_at ?? null,
          company: (setup.company as string) || "",
          goal: (setup.goal as string) || "",
          subscription: subs.get(email) ?? null,
          unread: unreadBy.get(u.id) ?? 0,
        };
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return NextResponse.json({ clients, events: events.data ?? [] });
  } catch (err) {
    console.error("owner clients failed", err);
    return NextResponse.json({ error: "Couldn't load clients." }, { status: 500 });
  }
}
