import { NextResponse } from "next/server";
import { ownerGuard } from "@/lib/owner-server";

export const dynamic = "force-dynamic";

const API = process.env.CAL_API_BASE ?? "https://api.cal.com/v2";

// Upcoming sales calls booked on Praz's Cal.com (needs CAL_API_KEY).
export async function GET(req: Request) {
  const g = await ownerGuard(req);
  if ("error" in g) return g.error;
  if (!process.env.CAL_API_KEY) return NextResponse.json({ error: "Add CAL_API_KEY to see upcoming calls." }, { status: 503 });
  try {
    const res = await fetch(`${API}/bookings?status=upcoming&sortStart=asc&take=50`, {
      headers: { Authorization: `Bearer ${process.env.CAL_API_KEY}`, "cal-api-version": "2024-08-13" },
      cache: "no-store",
    });
    const body = await res.json();
    if (!res.ok || body.status !== "success") {
      console.error("cal bookings failed", res.status, body);
      return NextResponse.json({ error: "Couldn't load bookings from Cal.com." }, { status: 502 });
    }
    const list = Array.isArray(body.data) ? body.data : (body.data?.bookings ?? []);
    const meetings = list.map((b: Record<string, unknown>) => {
      const attendees = (b.attendees as { name?: string; email?: string }[] | undefined) ?? [];
      return {
        id: b.uid ?? b.id,
        title: b.title,
        start: b.start,
        end: b.end,
        status: b.status,
        meetingUrl: b.meetingUrl ?? b.location ?? null,
        attendee: attendees[0] ?? null,
        notes: (b.bookingFieldsResponses as { notes?: string } | undefined)?.notes ?? b.description ?? null,
      };
    });
    return NextResponse.json({ meetings });
  } catch (err) {
    console.error("cal bookings error", err);
    return NextResponse.json({ error: "Couldn't load bookings from Cal.com." }, { status: 502 });
  }
}
