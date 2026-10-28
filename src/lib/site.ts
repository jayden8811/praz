// Central place for links and pricing — swap these for real URLs/prices.
export const site = {
  name: "Praz",
  bookUrl: "#book",
  checkoutUrl: "#checkout",
  loginUrl: "#login",
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

export const formatVolume = (v: number) =>
  v >= 1000 ? `${v / 1000}k` : String(v);
