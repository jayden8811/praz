import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { verifiedUser } from "@/lib/server-auth";

// Server-only Supabase client with the secret key: bypasses row level security.
// Never import this from a client component.

let client: SupabaseClient | null = null;

export function adminConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && secretKey());
}

const secretKey = () => process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export function admin() {
  if (!client) {
    client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, secretKey(), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

/** Emails allowed into the owner suite, from OWNER_EMAILS (comma-separated). */
export function ownerEmails() {
  return (process.env.OWNER_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** The signed-in owner, or null for anyone else. */
export async function verifiedOwner(req: Request) {
  const user = await verifiedUser(req);
  if (!user || !ownerEmails().includes(user.email.toLowerCase())) return null;
  return user;
}

/** Records something worth seeing in the owner suite's activity feed. Never throws. */
export async function logEvent(e: { userId?: string | null; email?: string | null; type: string; detail?: Record<string, unknown> }) {
  if (!adminConfigured()) return;
  try {
    await admin()
      .from("events")
      .insert({ user_id: e.userId ?? null, email: e.email?.toLowerCase() ?? null, type: e.type, detail: e.detail ?? {} });
  } catch (err) {
    console.error("logEvent failed", err);
  }
}

/** Finds an auth user by email (Supabase has no direct lookup, so page through). */
export async function userByEmail(email: string) {
  const target = email.toLowerCase();
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin().auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const hit = data.users.find((u) => u.email?.toLowerCase() === target);
    if (hit) return hit;
    if (data.users.length < 200) return null;
  }
  return null;
}
