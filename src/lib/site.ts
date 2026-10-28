// Central place for links and pricing — swap these for real URLs/prices.

// Internal page link. The static design preview serves each page as a sibling .html file.
export const page = (path: string) =>
  process.env.NEXT_PUBLIC_PREVIEW === "1" ? (path === "/" ? "./" : `${path.slice(1)}.html`) : path;

export const site = {
  name: "Praz",
  bookUrl: page("/book"),
  homeUrl: page("/"),
  onboardingUrl: page("/onboarding"),
  loginUrl: page("/login"),
  dashboardUrl: page("/dashboard"),
};

export const volumes = [1000, 2000, 3000, 4000, 5000] as const;

// Monthly price per daily sending volume (fully managed, done-for-you).
export const pricing: Record<(typeof volumes)[number], number> = {
  1000: 2497,
  2000: 3997,
  3000: 5497,
  4000: 6797,
  5000: 7997,
};

// Stripe price for each plan (monthly subscription). These are sandbox (test
// mode) prices; swap in the live-mode price IDs when you start charging.
export const stripePrices: Record<(typeof volumes)[number], string> = {
  1000: "price_1UVPfKRd50FYwzw3lx5t9pVc",
  2000: "price_1UVPfMRd50FYwzw39BxvYQYv",
  3000: "price_1UVPfPRd50FYwzw3nUtMXuSn",
  4000: "price_1UVPfRRd50FYwzw39qNrsWVd",
  5000: "price_1UVPfURd50FYwzw30oRT6JTf",
};

export const formatVolume = (v: number) =>
  v >= 1000 ? `${v / 1000}k` : String(v);
