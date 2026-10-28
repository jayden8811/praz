// Sample client data for the dashboard. In production this comes from the
// backend: sending stats from the campaign engine, calls from the client's
// CallRail account, and the goal/ICP/phone captured during onboarding.

export type Goal = "call" | "book";

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
  name: string;
  company: string;
  when: string;
  duration: string;
  status: "Answered" | "Missed" | "Voicemail";
};

export type Meeting = {
  name: string;
  company: string;
  when: string;
};

export const client = {
  name: "Northwind Capital",
  goal: "call" as Goal,
  phone: "+1 (415) 555-0142",
  calendar: "cal.com/northwind/intro",
  icp: "CFOs and VPs of Finance at US B2B SaaS companies, $10M–$50M ARR, Series B+.",
  operator: "Alex M.",
  dailyVolume: 1000,
  monthlyPrice: 2497,
  inboxes: 36,
  domains: 12,
  note: "Launched a new subject-line test on Monday. Variant B is pulling a 1.4% reply rate vs 0.9% on A, so it now gets all new sends.",
};

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
    const sent = weekday ? Math.round(client.dailyVolume * ramp) : 0;
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
  { name: "Dana Reyes", company: "Lumen Health", when: "Today, 1:12 PM", duration: "18m 04s", status: "Answered" },
  { name: "Marcus Tran", company: "Arcline", when: "Today, 10:41 AM", duration: "9m 37s", status: "Answered" },
  { name: "Priya Shah", company: "Northbeam", when: "Yesterday, 4:05 PM", duration: "0m 32s", status: "Voicemail" },
  { name: "Tom Becker", company: "Fieldwire", when: "Yesterday, 11:20 AM", duration: "—", status: "Missed" },
  { name: "Elena Ruiz", company: "Kitestring", when: "Oct 26, 2:48 PM", duration: "14m 51s", status: "Answered" },
];

export const meetings: Meeting[] = [
  { name: "Dana Reyes", company: "Lumen Health", when: "Thu, Oct 30 · 2:00 PM" },
  { name: "Marcus Tran", company: "Arcline", when: "Fri, Oct 31 · 11:30 AM" },
  { name: "Priya Shah", company: "Northbeam", when: "Mon, Nov 3 · 9:00 AM" },
  { name: "Tom Becker", company: "Fieldwire", when: "Tue, Nov 4 · 3:30 PM" },
  { name: "Elena Ruiz", company: "Kitestring", when: "Wed, Nov 5 · 1:00 PM" },
];
