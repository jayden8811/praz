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
  ownerUrl: page("/owner"),
  termsUrl: page("/terms"),
  privacyUrl: page("/privacy"),
};

export const volumes = [1000, 2000, 3000, 4000, 5000] as const;
export type Volume = (typeof volumes)[number];

// Volume the sliders start on; people can still drag down to 1,000.
export const defaultVolume: (typeof volumes)[number] = 2000;
export const defaultVolumeIndex = volumes.indexOf(defaultVolume);

// Monthly price per daily sending volume (fully managed, done-for-you).
export const pricing: Record<(typeof volumes)[number], number> = {
  1000: 2497,
  2000: 3997,
  3000: 5497,
  4000: 6797,
  5000: 7997,
};

// Each plan's Stripe price is found by this lookup key, so the same code works
// with sandbox and live keys. Missing prices are created on first use (billing-server.ts).
export const stripeLookupKey = (volume: (typeof volumes)[number]) => `praz_dfy_${volume}`;

export const formatVolume = (v: number) =>
  v >= 1000 ? `${v / 1000}k` : String(v);
