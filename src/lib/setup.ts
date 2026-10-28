// The client's setup, captured during onboarding and editable from the dashboard.
// Saved in the browser for now; in production this is stored on the backend.

import { defaultVolume, volumes } from "@/lib/site";

export type Goal = "call" | "book" | "website" | "inbox";

export type Setup = {
  accountEmail: string;
  company: string;
  website: string;
  offer: string;
  dealSize: number;
  icp: string;
  titles: string;
  industries: string;
  companySize: string;
  locations: string;
  problem: string;
  proof: string;
  cta: string;
  senderName: string;
  senderTitle: string;
  domainStyle: string;
  address: string;
  goal: Goal;
  phone: string;
  hours: string;
  calendar: string;
  email: string;
  landingPage: string;
  dailyVolume: (typeof volumes)[number];
  approval: "approve" | "operator";
  termsVersion: string;
  termsAcceptedAt: string;
};

export const goals: { value: Goal; title: string; example: string }[] = [
  {
    value: "call",
    title: "Send to my number",
    example: "Interested buyers call you directly. Calls are tracked so you see every one.",
  },
  {
    value: "book",
    title: "Book on my calendar",
    example: "Interested buyers pick a time on your calendar link.",
  },
  {
    value: "website",
    title: "Send to my website",
    example: "Interested buyers get a link to a page on your site, like pricing, a demo or a case study.",
  },
  {
    value: "inbox",
    title: "Reply to my inbox",
    example: "We forward every positive reply to your email so you can follow up.",
  },
];

export const goalLabel: Record<Goal, string> = {
  call: "Calls to your phone",
  book: "Booked calls",
  website: "Visits to your website",
  inbox: "Replies to your inbox",
};

export const sampleSetup: Setup = {
  accountEmail: "jordan@northwind.com",
  company: "Northwind Capital",
  website: "northwind.com",
  offer: "Fractional CFO services for venture-backed SaaS companies.",
  dealSize: 60000,
  icp: "CFOs and VPs of Finance at US B2B SaaS companies, $10M–$50M ARR, Series B+.",
  titles: "CFO, VP Finance, Head of Finance",
  industries: "B2B SaaS",
  companySize: "50–250 employees",
  locations: "United States",
  problem: "Finance teams that can't keep up with board reporting after a Series B.",
  proof: "Helped 40+ SaaS companies close their books in 5 days instead of 20.",
  cta: "A free 20-minute finance stack review.",
  senderName: "Jordan Lee",
  senderTitle: "Partner",
  domainStyle: "getnorthwind.com, northwindhq.com",
  address: "500 Howard St, San Francisco, CA 94105",
  goal: "call",
  phone: "+1 (415) 555-0142",
  hours: "Mon–Fri, 9am–6pm PT",
  calendar: "cal.com/northwind/intro",
  email: "jordan@northwind.com",
  landingPage: "northwind.com/demo",
  dailyVolume: 1000,
  approval: "approve",
  termsVersion: "",
  termsAcceptedAt: "",
};

export const emptySetup: Setup = {
  ...sampleSetup,
  accountEmail: "",
  company: "",
  website: "",
  offer: "",
  dealSize: 25000,
  dailyVolume: defaultVolume,
  icp: "",
  titles: "",
  industries: "",
  companySize: "",
  locations: "",
  problem: "",
  proof: "",
  cta: "",
  senderName: "",
  senderTitle: "",
  domainStyle: "",
  address: "",
  phone: "",
  hours: "",
  calendar: "",
  email: "",
  landingPage: "",
};

// Where interested buyers are sent for the chosen goal, and whether it's filled in.
export function destination(s: Setup) {
  return { call: s.phone, book: s.calendar, website: s.landingPage, inbox: s.email }[s.goal];
}

export function destinationValid(s: Setup) {
  switch (s.goal) {
    case "call":
      return s.phone.replace(/\D/g, "").length >= 10;
    case "book":
      return s.calendar.trim().length > 4;
    case "website":
      return /\S+\.\S+/.test(s.landingPage);
    case "inbox":
      return /\S+@\S+\.\S+/.test(s.email);
  }
}

const KEY = "praz:setup";

export function loadSetup(): Setup | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...sampleSetup, ...JSON.parse(raw) } : null;
  } catch {
    return null;
  }
}

export function saveSetup(setup: Setup) {
  try {
    localStorage.setItem(KEY, JSON.stringify(setup));
  } catch {
    // storage unavailable (private window); the in-memory state still works
  }
}
