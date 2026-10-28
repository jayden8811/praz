// Sales-call booking against Praz's Cal.com event. The browser talks to our own
// /api/booking route, which calls Cal.com's API v2. The static design preview
// has no server, so it shows sample times instead.

export const cal = {
  username: "praz-kjqqtj",
  eventSlug: "15min",
  minutes: 15,
  publicUrl: "https://cal.com/praz-kjqqtj/15min",
};

export type SlotsByDay = Record<string, string[]>; // YYYY-MM-DD -> ISO start times

export type BookingRequest = {
  start: string;
  name: string;
  email: string;
  website: string;
  notes: string;
  timeZone: string;
};

export type BookingResult = { ok: true; start: string; meetingUrl?: string } | { ok: false; error: string };

const isPreview = process.env.NEXT_PUBLIC_PREVIEW === "1";
export const bookingPreview = isPreview;

export const viewerTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

/** YYYY-MM-DD for a date as seen in the given time zone. */
export const dayKey = (d: Date, timeZone: string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);

/** The next `count` calendar days, starting today, in the viewer's time zone. */
export function nextDays(count: number, timeZone: string) {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(now + i * 86_400_000);
    return { key: dayKey(date, timeZone), date };
  });
}

export async function fetchSlots(start: string, end: string, timeZone: string): Promise<SlotsByDay> {
  if (isPreview) return sampleSlots(start, timeZone);
  const qs = new URLSearchParams({ start, end, timeZone });
  const res = await fetch(`/api/booking?${qs}`, { cache: "no-store" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Couldn't load times.");
  return data.slots as SlotsByDay;
}

export async function createBooking(req: BookingRequest): Promise<BookingResult> {
  if (isPreview) return { ok: true, start: req.start };
  const res = await fetch("/api/booking", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: data.error ?? "Couldn't book that time. Please pick another." };
  return { ok: true, start: data.start, meetingUrl: data.meetingUrl };
}

// Weekday business-hours times for the preview, so the flow can be clicked through.
function sampleSlots(start: string, timeZone: string): SlotsByDay {
  const out: SlotsByDay = {};
  const base = new Date(`${start}T12:00:00Z`).getTime();
  for (let i = 0; i < 7; i++) {
    const noon = new Date(base + i * 86_400_000);
    const key = dayKey(noon, timeZone);
    const weekday = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short" }).format(noon);
    if (weekday === "Sat" || weekday === "Sun") {
      out[key] = [];
      continue;
    }
    const times: string[] = [];
    for (const [h, m] of [[9, 0], [9, 30], [10, 15], [11, 0], [13, 0], [13, 45], [14, 30], [15, 15], [16, 0]]) {
      if ((h + m + i) % 3 === 0) continue; // leave gaps so days differ
      // Build the local wall-clock time in the viewer's zone.
      const guess = new Date(`${key}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00Z`);
      const offset = zoneOffsetMinutes(guess, timeZone);
      const t = new Date(guess.getTime() - offset * 60_000);
      if (t.getTime() > Date.now() + 3_600_000) times.push(t.toISOString());
    }
    out[key] = times;
  }
  return out;
}

function zoneOffsetMinutes(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(date);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"));
  return Math.round((asUtc - date.getTime()) / 60_000);
}
