// Emails the Praz team (operator inbox) through Resend's API. Server-only.
export const teamInbox = () => process.env.TEAM_EMAIL || "contact@praz.ai";

export async function notifyTeam({ subject, text, replyTo }: { subject: string; text: string; replyTo?: string }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("notify: RESEND_API_KEY is not set; message not sent:", subject);
    return false;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.NOTIFY_FROM || "Praz <no-reply@praz.ai>",
      to: [teamInbox()],
      subject,
      text,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });
  if (!res.ok) console.error("notify: resend failed", res.status, await res.text().catch(() => ""));
  return res.ok;
}

/** A readable summary of a client's setup for the team. */
export function describeSetup(s: Record<string, unknown>) {
  const rows: [string, unknown][] = [
    ["Account email", s.accountEmail],
    ["Company", s.company],
    ["Website", s.website],
    ["What they sell", s.offer],
    ["Deal size / LTV", s.dealSize],
    ["Ideal customer", s.icp],
    ["Titles", s.titles],
    ["Industries", s.industries],
    ["Company size", s.companySize],
    ["Locations", s.locations],
    ["Problem solved", s.problem],
    ["Proof", s.proof],
    ["Offer to prospects", s.cta],
    ["Sender", [s.senderName, s.senderTitle].filter(Boolean).join(", ")],
    ["Domain preferences", s.domainStyle],
    ["Business address", s.address],
    ["Goal", s.goal],
    ["Phone", s.phone],
    ["Call hours", s.hours],
    ["Booking link", s.calendar],
    ["Forwarding email", s.email],
    ["Website page", s.landingPage],
    ["Daily volume", s.dailyVolume],
    ["Copy approval", s.approval],
    ["Terms accepted", [s.termsVersion, s.termsAcceptedAt].filter(Boolean).join(" at ")],
  ];
  return rows
    .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== "")
    .map(([k, v]) => `${k}: ${String(v).slice(0, 2000)}`)
    .join("\n");
}
