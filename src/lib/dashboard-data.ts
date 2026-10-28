// Sample campaign data for the dashboard. In production this comes from the
// backend: sending stats from the campaign engine and calls from the client's
// CallRail account. The client's own setup lives in lib/setup.ts.

export type Day = {
  date: string; // YYYY-MM-DD
  sent: number;
  replies: number;
  positive: number;
  calls: number;
  answered: number;
  meetings: number;
};

export type PositiveReply = {
  name: string;
  title: string;
  company: string;
  message: string;
  when: string;
};

export type Call = {
  from: string; // caller's number, as reported by CallRail
  location: string;
  when: string;
  duration: string;
  status: "Answered" | "Missed" | "Voicemail";
};

export type Meeting = {
  name: string;
  company: string;
  when: string;
};

export const operator = {
  name: "Alex M.",
  note: "Launched a new subject-line test on Monday. Variant B is pulling a 1.4% reply rate vs 0.9% on A, so it now gets all new sends.",
};

const SAMPLE_DAILY_VOLUME = 1000;

// Deterministic pseudo-random numbers so server and client render the same data.
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const END = new Date(Date.UTC(2026, 9, 28)); // last day of sample data
export const DAYS = 182;

export const days: Day[] = (() => {
  const rand = rng(7);
  const out: Day[] = [];
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(END);
    d.setUTCDate(END.getUTCDate() - i);
    const weekday = d.getUTCDay() % 6 !== 0; // no sending on weekends
    // ramp up over the first two weeks while inboxes warm
    const ramp = Math.min(1, (DAYS - i) / 14);
    const sent = weekday ? Math.round(SAMPLE_DAILY_VOLUME * ramp) : 0;
    const replies = Math.round(sent * (0.006 + rand() * 0.01));
    const positive = Math.round(replies * (0.02 + rand() * 0.08));
    const calls = Math.min(positive, Math.round(positive * (0.4 + rand() * 0.5)));
    let answered = 0;
    for (let c = 0; c < calls; c++) if (rand() < 0.75) answered++;
    const meetings = Math.min(positive, Math.round(positive * (0.3 + rand() * 0.5)));
    out.push({ date: d.toISOString().slice(0, 10), sent, replies, positive, calls, answered, meetings });
  }
  return out;
})();

export function totals(range: Day[]) {
  return range.reduce(
    (t, d) => ({
      sent: t.sent + d.sent,
      replies: t.replies + d.replies,
      positive: t.positive + d.positive,
      calls: t.calls + d.calls,
      answered: t.answered + d.answered,
      meetings: t.meetings + d.meetings,
    }),
    { sent: 0, replies: 0, positive: 0, calls: 0, answered: 0, meetings: 0 }
  );
}

export const positiveReplies: PositiveReply[] = [
  { name: "Dana Reyes", title: "CFO", company: "Lumen Health", message: "Timing is good. Can you call me Thursday afternoon?", when: "2h ago" },
  { name: "Marcus Tran", title: "VP Finance", company: "Arcline", message: "Interested. What does onboarding look like on your end?", when: "5h ago" },
  { name: "Priya Shah", title: "CFO", company: "Northbeam", message: "Send over a time, happy to chat next week.", when: "Yesterday" },
  { name: "Tom Becker", title: "Head of Finance", company: "Fieldwire", message: "We're reviewing vendors this quarter. Let's talk.", when: "Yesterday" },
  { name: "Elena Ruiz", title: "CFO", company: "Kitestring", message: "Yes, worth a conversation. Best number to reach you?", when: "2d ago" },
];

export const calls: Call[] = [
  { from: "+1 (646) 555-0187", location: "New York, NY", when: "Today, 1:12 PM", duration: "18m 04s", status: "Answered" },
  { from: "+1 (512) 555-0123", location: "Austin, TX", when: "Today, 10:41 AM", duration: "9m 37s", status: "Answered" },
  { from: "+1 (617) 555-0164", location: "Boston, MA", when: "Yesterday, 4:05 PM", duration: "0m 32s", status: "Voicemail" },
  { from: "+1 (312) 555-0149", location: "Chicago, IL", when: "Yesterday, 11:20 AM", duration: "—", status: "Missed" },
  { from: "+1 (206) 555-0178", location: "Seattle, WA", when: "Oct 26, 2:48 PM", duration: "14m 51s", status: "Answered" },
];

export const meetings: Meeting[] = [
  { name: "Dana Reyes", company: "Lumen Health", when: "Thu, Oct 30 · 2:00 PM" },
  { name: "Marcus Tran", company: "Arcline", when: "Fri, Oct 31 · 11:30 AM" },
  { name: "Priya Shah", company: "Northbeam", when: "Mon, Nov 3 · 9:00 AM" },
  { name: "Tom Becker", company: "Fieldwire", when: "Tue, Nov 4 · 3:30 PM" },
  { name: "Elena Ruiz", company: "Kitestring", when: "Wed, Nov 5 · 1:00 PM" },
];

/** The same six-month calendar with nothing in it yet, for accounts whose campaign hasn't started. */
export function emptyDays(): Day[] {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return Array.from({ length: DAYS }, (_, i) => {
    const d = new Date(today.getTime() - (DAYS - 1 - i) * 86_400_000);
    return { date: d.toISOString().slice(0, 10), sent: 0, replies: 0, positive: 0, calls: 0, answered: 0, meetings: 0 };
  });
}
