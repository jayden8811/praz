import Stripe from "stripe";

// Server-only Stripe helpers shared by the checkout routes.

export const publishableKey = () => process.env.STRIPE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";

const modeOf = (key: string) => (key.includes("_live_") ? "live" : key.includes("_test_") ? "test" : "unknown");

/** Explains what's wrong with the Stripe keys, or null when they're usable together. */
export function keyProblem(): string | null {
  const secret = process.env.STRIPE_SECRET_KEY ?? "";
  const pk = publishableKey();
  if (!secret) return "STRIPE_SECRET_KEY is not set.";
  if (!pk) return "STRIPE_PUBLISHABLE_KEY (or NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) is not set.";
  if (!/^(sk|rk)_/.test(secret)) return "STRIPE_SECRET_KEY should start with sk_test_ or sk_live_.";
  if (!pk.startsWith("pk_")) return "The publishable key should start with pk_test_ or pk_live_.";
  if (modeOf(secret) !== modeOf(pk)) return "The secret and publishable keys are from different modes (one test, one live).";
  return null;
}

let client: Stripe | null = null;
export function stripe() {
  if (!client) client = new Stripe(process.env.STRIPE_SECRET_KEY!);
  return client;
}
