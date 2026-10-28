// Client accounts: email + password sign-in, password reset, and the client's
// setup stored on their account. Uses Supabase Auth when its keys are set.
// Without keys (the static design preview) it falls back to a stand-in that
// keeps accounts in this browser only, so the flow can still be tried.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { page } from "@/lib/site";
import type { Setup } from "@/lib/setup";

export type AuthResult = { ok: true; needsConfirmation?: boolean } | { ok: false; error: string };

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const authConfigured = Boolean(url && key);

let client: SupabaseClient | null = null;
function supabase() {
  if (!client) client = createClient(url!, key!);
  return client;
}

const friendly = (message: string) => {
  if (/invalid login credentials/i.test(message)) return "That email and password don't match.";
  if (/already registered/i.test(message)) return "An account with this email already exists. Log in instead.";
  if (/email not confirmed/i.test(message)) return "Confirm your email first. Check your inbox for the link we sent.";
  if (/password should be at least/i.test(message)) return "Use at least 8 characters for your password.";
  if (/rate limit/i.test(message)) return "Too many attempts. Wait a minute and try again.";
  return message;
};

const absolute = (path: string) => new URL(page(path), window.location.href).toString();

/** `consent` records which Terms/Privacy version the person agreed to, and when. */
export async function signUp(
  email: string,
  password: string,
  consent: { termsVersion: string; termsAcceptedAt: string }
): Promise<AuthResult> {
  if (!authConfigured) return preview.signUp(email, password);
  const { data, error } = await supabase().auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: absolute("/dashboard"),
      data: { terms_version: consent.termsVersion, terms_accepted_at: consent.termsAcceptedAt },
    },
  });
  if (error) return { ok: false, error: friendly(error.message) };
  // With email confirmation on, an existing address comes back as a user with no identities.
  if (data.user && data.user.identities?.length === 0) {
    return { ok: false, error: "An account with this email already exists. Log in instead." };
  }
  return { ok: true, needsConfirmation: !data.session };
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  if (!authConfigured) return preview.signIn(email, password);
  const { error } = await supabase().auth.signInWithPassword({ email, password });
  return error ? { ok: false, error: friendly(error.message) } : { ok: true };
}

/** Sends the sign-up confirmation email again. */
export async function resendConfirmation(email: string): Promise<AuthResult> {
  if (!authConfigured) return { ok: true };
  const { error } = await supabase().auth.resend({ type: "signup", email, options: { emailRedirectTo: absolute("/dashboard") } });
  return error ? { ok: false, error: friendly(error.message) } : { ok: true };
}

export async function signOut() {
  if (!authConfigured) return preview.signOut();
  await supabase().auth.signOut();
}

export async function sendPasswordReset(email: string): Promise<AuthResult> {
  if (!authConfigured) return { ok: true };
  const { error } = await supabase().auth.resetPasswordForEmail(email, { redirectTo: absolute("/reset-password") });
  return error ? { ok: false, error: friendly(error.message) } : { ok: true };
}

/** Sets a new password for the signed-in user (after following a reset link). */
export async function updatePassword(password: string, previewEmail?: string): Promise<AuthResult> {
  if (!authConfigured) return preview.updatePassword(password, previewEmail);
  const { error } = await supabase().auth.updateUser({ password });
  return error ? { ok: false, error: friendly(error.message) } : { ok: true };
}

export async function currentEmail(): Promise<string | null> {
  if (!authConfigured) return preview.currentEmail();
  const { data } = await supabase().auth.getSession();
  return data.session?.user.email ?? null;
}

/** Calls one of our own API routes as the signed-in user. */
export async function authedFetch(path: string, init: RequestInit = {}) {
  const token = authConfigured ? (await supabase().auth.getSession()).data.session?.access_token : null;
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body) headers.set("Content-Type", "application/json");
  return fetch(path, { ...init, headers, cache: "no-store" });
}

/** True once the reset link has signed the user in for a password change. */
export function onPasswordRecovery(cb: () => void) {
  if (!authConfigured) return () => {};
  const { data } = supabase().auth.onAuthStateChange((event) => {
    if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") cb();
  });
  return () => data.subscription.unsubscribe();
}

export async function saveSetupToAccount(setup: Setup) {
  if (!authConfigured) return;
  const { data } = await supabase().auth.getSession();
  if (data.session) await supabase().auth.updateUser({ data: { setup } });
}

export async function loadSetupFromAccount(): Promise<Setup | null> {
  if (!authConfigured) return null;
  const { data } = await supabase().auth.getUser();
  return (data.user?.user_metadata?.setup as Setup | undefined) ?? null;
}

/* ------------------------------------------------------------------ */
/* Preview stand-in: accounts live in this browser only.               */
/* ------------------------------------------------------------------ */

const ACCOUNTS = "praz:preview-accounts";
const SESSION = "praz:preview-session";

function read<T>(k: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(k: string, v: unknown) {
  try {
    if (v === null) localStorage.removeItem(k);
    else localStorage.setItem(k, JSON.stringify(v));
  } catch {
    // storage unavailable
  }
}

async function hash(email: string, password: string) {
  const bytes = new TextEncoder().encode(`${email.toLowerCase()}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

const preview = {
  async signUp(email: string, password: string): Promise<AuthResult> {
    const accounts = read<Record<string, string>>(ACCOUNTS, {});
    const id = email.toLowerCase();
    if (accounts[id]) return { ok: false, error: "An account with this email already exists. Log in instead." };
    accounts[id] = await hash(email, password);
    write(ACCOUNTS, accounts);
    write(SESSION, id);
    return { ok: true };
  },
  async signIn(email: string, password: string): Promise<AuthResult> {
    const accounts = read<Record<string, string>>(ACCOUNTS, {});
    const id = email.toLowerCase();
    if (!accounts[id] || accounts[id] !== (await hash(email, password))) {
      return { ok: false, error: "That email and password don't match." };
    }
    write(SESSION, id);
    return { ok: true };
  },
  async signOut() {
    write(SESSION, null);
  },
  async updatePassword(password: string, email?: string): Promise<AuthResult> {
    const accounts = read<Record<string, string>>(ACCOUNTS, {});
    const id = (email ?? read<string | null>(SESSION, null) ?? "").toLowerCase();
    if (!accounts[id]) return { ok: false, error: "We couldn't find that account." };
    accounts[id] = await hash(id, password);
    write(ACCOUNTS, accounts);
    write(SESSION, id);
    return { ok: true };
  },
  async currentEmail() {
    return read<string | null>(SESSION, null);
  },
};
