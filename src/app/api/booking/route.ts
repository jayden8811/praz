import { NextResponse } from "next/server";
import { cal, type BookingRequest, type SlotsByDay } from "@/lib/booking";

// Proxies Praz's public Cal.com event: lists open times and books one.
// CAL_API_KEY is optional; public event types work without it.

// CAL_API_BASE is only for pointing tests at a local stand-in.
const API = process.env.CAL_API_BASE ?? "https://api.cal.com/v2";

function headers(version: string) {
  const h: Record<string, string> = { "cal-api-version": version, "Content-Type": "application/json" };
  if (process.env.CAL_API_KEY) h.Authorization = `Bearer ${process.env.CAL_API_KEY}`;
  return h;
}

const isDate = (s: string | null) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const start = params.get("start");
  const end = params.get("end");
  const timeZone = params.get("timeZone") ?? "UTC";
  if (!isDate(start) || !isDate(end)) return NextResponse.json({ error: "Invalid date range" }, { status: 400 });

  const qs = new URLSearchParams({ username: cal.username, eventTypeSlug: cal.eventSlug, start: start!, end: end!, timeZone });
  try {
    const res = await fetch(`${API}/slots?${qs}`, { headers: headers("2024-09-04"), cache: "no-store" });
    const body = await res.json();
    if (!res.ok || body.status !== "success") {
      console.error("cal slots failed", res.status, body);
      return NextResponse.json({ error: "Couldn't load times. Please try again." }, { status: 502 });
    }
    // Response: { status, data: { "YYYY-MM-DD": [{ start }] } }
    const slots: SlotsByDay = {};
    for (const [day, list] of Object.entries(body.data as Record<string, { start: string }[]>)) {
      slots[day] = list.map((s) => s.start);
    }
    return NextResponse.json({ slots });
  } catch (err) {
    console.error("cal slots error", err);
    return NextResponse.json({ error: "Couldn't load times. Please try again." }, { status: 502 });
  }
}

export async function POST(req: Request) {
  let input: BookingRequest;
  try {
    input = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (!input.start || !input.name?.trim() || !/\S+@\S+\.\S+/.test(input.email ?? "")) {
    return NextResponse.json({ error: "Add your name and a valid email." }, { status: 400 });
  }

  const notes = [input.website?.trim() && `Website: ${input.website.trim()}`, input.notes?.trim()].filter(Boolean).join("\n\n");
  try {
    const res = await fetch(`${API}/bookings`, {
      method: "POST",
      headers: headers("2024-08-13"),
      body: JSON.stringify({
        start: input.start,
        username: cal.username,
        eventTypeSlug: cal.eventSlug,
        attendee: { name: input.name.trim(), email: input.email.trim(), timeZone: input.timeZone || "UTC", language: "en" },
        ...(notes ? { bookingFieldsResponses: { notes } } : {}),
        metadata: { source: "praz-site" },
      }),
    });
    const body = await res.json();
    if (!res.ok || body.status !== "success") {
      console.error("cal booking failed", res.status, body);
      const taken = /no available|not available|already|slot/i.test(JSON.stringify(body.error ?? body));
      return NextResponse.json(
        { error: taken ? "That time was just taken. Please pick another." : "Couldn't book that time. Please try again." },
        { status: taken ? 409 : 502 }
      );
    }
    return NextResponse.json({ start: body.data.start, meetingUrl: body.data.meetingUrl ?? body.data.location });
  } catch (err) {
    console.error("cal booking error", err);
    return NextResponse.json({ error: "Couldn't book that time. Please try again." }, { status: 502 });
  }
}
