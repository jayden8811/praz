"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowUpRight, Inbox, LayoutGrid, Loader2, LogOut, RefreshCw, Trash2, Users, Video } from "lucide-react";
import { LogoMark } from "@/components/logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { authConfigured, authedFetch, currentEmail, signOut } from "@/lib/auth";
import { goalLabel, type Goal } from "@/lib/setup";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Types and helpers                                                   */
/* ------------------------------------------------------------------ */

type Sub = {
  id: string;
  status: string;
  volume: number | null;
  amount: number;
  currentPeriodEnd: number | null;
  cancelAtPeriodEnd: boolean;
  card: { brand: string; last4: string } | null;
} | null;

type ClientRow = {
  id: string;
  email: string;
  confirmed: boolean;
  createdAt: string;
  lastSignInAt: string | null;
  company: string;
  goal: string;
  subscription: Sub;
  unread: number;
};

type Event = { id: string; user_id: string | null; email: string | null; type: string; detail: Record<string, unknown>; created_at: string };
type Msg = { id: string; user_id: string; sender: "client" | "operator"; body: string; created_at: string; read_by_owner?: boolean };

type Detail = {
  user: { id: string; email: string; confirmed: boolean; createdAt: string; lastSignInAt: string | null; termsVersion: string | null; termsAcceptedAt: string | null };
  setup: Record<string, unknown> | null;
  subscription: Sub;
  stats: { day: string; sent: number; replies: number; positive: number; calls: number; answered: number; meetings: number }[];
  replies: { id: string; name: string; title: string | null; company: string | null; message: string; received_at: string }[];
  calls: { id: string; from_number: string; location: string | null; called_at: string; duration_seconds: number | null; status: string }[];
  meetings: { id: string; name: string; company: string | null; starts_at: string }[];
  settings: { operator_name: string | null; operator_note: string | null; campaign_live: boolean } | null;
  messages: Msg[];
  events: Event[];
};

const usd = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const int = (n: number) => Math.round(n).toLocaleString("en-US");
const dt = (iso: string) => new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
const day = (unix: number) => new Date(unix * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const today = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
// datetime-local values are local time; convert here so the UTC server stores the right moment.
const iso = (v: string) => (v ? new Date(v).toISOString() : "");

const EVENT_LABEL: Record<string, string> = {
  subscribed: "Started subscription",
  plan_upgraded: "Upgraded plan",
  plan_downgraded: "Downgraded plan",
  cancellation_scheduled: "Cancelled (ends at period end)",
  cancellation_reversed: "Undid cancellation",
  subscription_ended: "Subscription ended",
  payment_failed: "Payment failed",
  status_past_due: "Payment past due",
  status_active: "Subscription active again",
  setup_updated: "Edited setup",
  inbound_email: "Email to contact@praz.ai",
};
const eventLabel = (e: Event) => {
  const base = EVENT_LABEL[e.type] ?? e.type.replace(/_/g, " ");
  const d = e.detail ?? {};
  if ((e.type === "plan_upgraded" || e.type === "plan_downgraded") && d.from != null) return `${base}: ${int(Number(d.from))} → ${int(Number(d.to))}/day`;
  if (e.type === "subscribed" && d.volume) return `${base}: ${int(Number(d.volume))}/day`;
  return base;
};
const eventTone = (t: string) =>
  t === "subscribed" || t === "plan_upgraded" || t === "status_active" || t === "cancellation_reversed"
    ? "bg-yellow-300/15 text-yellow-100"
    : t.includes("cancel") || t.includes("ended") || t.includes("failed") || t.includes("past_due")
      ? "bg-red-400/10 text-red-200"
      : "bg-white/[0.06] text-white/70";

function planStatus(s: Sub): { label: string; tone: string } {
  if (!s) return { label: "No plan", tone: "bg-white/[0.06] text-white/60" };
  if (s.status === "past_due" || s.status === "unpaid") return { label: "Past due", tone: "bg-red-400/10 text-red-200" };
  if (s.status === "canceled") return { label: "Cancelled", tone: "bg-red-400/10 text-red-200" };
  if (s.cancelAtPeriodEnd) return { label: `Cancels ${s.currentPeriodEnd ? day(s.currentPeriodEnd) : ""}`, tone: "bg-red-400/10 text-red-200" };
  return { label: "Active", tone: "bg-yellow-300/15 text-yellow-100" };
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await authedFetch(path, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error ?? "Something went wrong."), { status: res.status });
  return data as T;
}

/* ------------------------------------------------------------------ */
/* Shell                                                               */
/* ------------------------------------------------------------------ */

type Tab = "overview" | "clients" | "inbox" | "meetings";

export function OwnerSuite() {
  const [me, setMe] = useState<string | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "denied" | "error">("loading");
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("overview");
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const d = await api<{ clients: ClientRow[]; events: Event[] }>("/api/owner/clients");
      setClients(d.clients);
      setEvents(d.events);
      setState("ready");
    } catch (e) {
      const status = (e as { status?: number }).status;
      setError((e as Error).message);
      setState(status === 403 ? "denied" : "error");
    }
  }, []);

  useEffect(() => {
    (async () => {
      if (!authConfigured) {
        setError("Sign-in isn't connected on this site.");
        setState("error");
        return;
      }
      const email = await currentEmail();
      if (!email) {
        window.location.href = site.loginUrl;
        return;
      }
      setMe(email);
      load();
    })();
  }, [load]);

  const open = (id: string) => {
    setOpenId(id);
    window.scrollTo({ top: 0 });
  };

  const unreadTotal = clients.reduce((n, c) => n + c.unread, 0);

  return (
    <div className="relative flex min-h-svh flex-col">
      <header className="flex items-center justify-between gap-3 px-4 py-3 md:px-5">
        <span className="flex min-w-0 items-baseline gap-2">
          <span className="text-[13px] font-medium text-white/90">Owner suite</span>
          {me && <span className="hidden truncate text-[11px] text-muted-foreground sm:inline">{me}</span>}
        </span>
        <nav className="flex items-center gap-1">
          <button onClick={load} className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] text-white/70 hover:bg-white/[0.05] hover:text-white cursor-pointer">
            <RefreshCw className="size-3.5" /> Refresh
          </button>
          <button
            onClick={async () => {
              await signOut();
              window.location.href = site.homeUrl;
            }}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] text-white/70 hover:bg-white/[0.05] hover:text-white cursor-pointer"
          >
            <LogOut className="size-3.5" /> Log out
          </button>
        </nav>
      </header>

      <div className="mx-auto w-full max-w-[960px] flex-1 px-4 pb-16 pt-8">
        <div className="flex items-center gap-3">
          <LogoMark className="size-8 text-white" />
          <h1 className="text-[20px] font-medium tracking-[-0.02em]">Control panel</h1>
        </div>

        {state === "loading" && (
          <p className="mt-10 flex items-center gap-2 text-[12px] text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" /> Loading…
          </p>
        )}
        {state === "denied" && (
          <div className="glass mt-10 rounded-xl p-5 text-[13px] text-white/85">
            This area is only for the Praz owner. You&apos;re signed in as {me}.{" "}
            <a href={site.dashboardUrl} className="underline underline-offset-4">Go to your dashboard</a>.
          </div>
        )}
        {state === "error" && <div className="glass mt-10 rounded-xl p-5 text-[13px] text-red-200">{error}</div>}

        {state === "ready" &&
          (openId ? (
            <ClientDetail id={openId} onBack={() => { setOpenId(null); load(); }} />
          ) : (
            <>
              <div className="mt-6 flex flex-wrap gap-1 text-[12px]">
                {(
                  [
                    ["overview", "Overview", LayoutGrid],
                    ["clients", `Clients · ${clients.length}`, Users],
                    ["inbox", unreadTotal ? `Inbox · ${unreadTotal} new` : "Inbox", Inbox],
                    ["meetings", "Upcoming calls", Video],
                  ] as const
                ).map(([id, label, Icon]) => (
                  <button
                    key={id}
                    onClick={() => setTab(id)}
                    className={cn(
                      "relative flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors cursor-pointer",
                      tab === id ? "text-white" : "text-muted-foreground hover:text-white/80"
                    )}
                  >
                    {tab === id && <motion.span layoutId="owner-tab" className="absolute inset-0 rounded-md bg-white/[0.07]" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                    <Icon className="relative size-3.5" />
                    <span className="relative">{label}</span>
                  </button>
                ))}
              </div>
              <div className="mt-5">
                {tab === "overview" && <Overview clients={clients} events={events} open={open} />}
                {tab === "clients" && <ClientList clients={clients} open={open} />}
                {tab === "inbox" && <InboxView clients={clients} open={open} />}
                {tab === "meetings" && <Meetings />}
              </div>
            </>
          ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Overview, clients, inbox, meetings                                  */
/* ------------------------------------------------------------------ */

function Overview({ clients, events, open }: { clients: ClientRow[]; events: Event[]; open: (id: string) => void }) {
  const active = clients.filter((c) => c.subscription && ["active", "trialing"].includes(c.subscription.status) && !c.subscription.cancelAtPeriodEnd);
  const mrr = clients.reduce((n, c) => n + (c.subscription && ["active", "trialing", "past_due"].includes(c.subscription.status) ? c.subscription.amount : 0), 0);
  const cancelling = clients.filter((c) => c.subscription?.cancelAtPeriodEnd).length;
  const pastDue = clients.filter((c) => c.subscription && ["past_due", "unpaid"].includes(c.subscription.status)).length;
  const signups = clients.filter((c) => !c.subscription).length;
  const byEmail = new Map(clients.map((c) => [c.email, c]));

  return (
    <>
      <dl className="glass grid grid-cols-2 rounded-xl py-1 sm:grid-cols-5">
        {[
          [int(active.length), "Active clients"],
          [usd(mrr), "Monthly revenue"],
          [int(cancelling), "Cancelling"],
          [int(pastDue), "Past due"],
          [int(signups), "Signed up, not paid"],
        ].map(([k, v], i) => (
          <div key={v} className={cn("flex flex-col items-center px-2 py-2.5 text-center", i > 0 && "sm:border-l sm:border-white/[0.06]", i === 4 && "max-sm:col-span-2")}>
            <dt className="text-[13px] font-medium tabular-nums">{k}</dt>
            <dd className="mt-0.5 text-[11px] text-muted-foreground">{v}</dd>
          </div>
        ))}
      </dl>

      <h2 className="mt-8 text-[13px] font-medium">Recent activity</h2>
      {events.length === 0 ? (
        <p className="glass-inset mt-2 rounded-lg px-3 py-4 text-center text-[12px] text-muted-foreground">Sign-ups, payments, plan changes and cancellations show up here.</p>
      ) : (
        <ul className="mt-2 divide-y divide-white/[0.05]">
          {events.map((e) => {
            const c = (e.user_id && clients.find((x) => x.id === e.user_id)) || (e.email ? byEmail.get(e.email) : undefined);
            return (
              <li key={e.id} className="flex items-center gap-3 py-2 text-[12px]">
                <span className={cn("shrink-0 rounded px-1.5 py-px text-[10px] font-medium", eventTone(e.type))}>{eventLabel(e)}</span>
                <button onClick={() => c && open(c.id)} disabled={!c} className="min-w-0 truncate text-left text-white/85 hover:text-white disabled:cursor-default cursor-pointer">
                  {c?.company || e.email || "Unknown"}
                </button>
                <span className="ml-auto shrink-0 text-[11px] text-muted-foreground">{dt(e.created_at)}</span>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

function ClientList({ clients, open }: { clients: ClientRow[]; open: (id: string) => void }) {
  const [q, setQ] = useState("");
  const shown = clients.filter((c) => !q || `${c.company} ${c.email}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by company or email" className="h-9 max-w-xs text-[13px]" aria-label="Search clients" />
      <div className="glass mt-3 overflow-x-auto rounded-xl">
        <table className="w-full min-w-[640px] text-left text-[12px]">
          <thead className="text-muted-foreground">
            <tr className="border-b border-white/[0.06]">
              {["Client", "Plan", "Status", "Goal", "Joined", ""].map((h) => (
                <th key={h} className="px-4 py-2.5 font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((c) => {
              const st = planStatus(c.subscription);
              return (
                <tr key={c.id} onClick={() => open(c.id)} className="cursor-pointer border-b border-white/[0.04] transition-colors last:border-0 hover:bg-white/[0.03]">
                  <td className="px-4 py-2.5">
                    <p className="font-medium text-white/90">{c.company || "—"}</p>
                    <p className="text-[11px] text-muted-foreground">{c.email}{!c.confirmed && " · unconfirmed"}</p>
                  </td>
                  <td className="px-4 py-2.5 tabular-nums">{c.subscription ? `${c.subscription.volume ? int(c.subscription.volume) + "/day · " : ""}${usd(c.subscription.amount)}/mo` : "—"}</td>
                  <td className="px-4 py-2.5"><span className={cn("rounded px-1.5 py-px text-[10px] font-medium", st.tone)}>{st.label}</span></td>
                  <td className="px-4 py-2.5 text-white/75">{c.goal ? goalLabel[c.goal as Goal] ?? c.goal : "—"}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td>
                  <td className="px-4 py-2.5 text-right">{c.unread > 0 && <span className="rounded-full bg-yellow-300 px-1.5 text-[10px] font-medium text-zinc-950">{c.unread}</span>}</td>
                </tr>
              );
            })}
            {shown.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">No clients yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function InboxView({ clients, open }: { clients: ClientRow[]; open: (id: string) => void }) {
  const [data, setData] = useState<{ messages: Msg[]; inbound: Event[] } | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    api<{ messages: Msg[]; inbound: Event[] }>("/api/owner/inbox").then(setData).catch((e) => setError(e.message));
  }, []);
  const byId = new Map(clients.map((c) => [c.id, c]));
  if (error) return <p className="text-[12px] text-red-200">{error}</p>;
  if (!data) return <p className="flex items-center gap-2 text-[12px] text-muted-foreground"><Loader2 className="size-3.5 animate-spin" /> Loading…</p>;
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section>
        <h2 className="text-[13px] font-medium">Client messages</h2>
        {data.messages.length === 0 ? (
          <p className="glass-inset mt-2 rounded-lg px-3 py-4 text-center text-[12px] text-muted-foreground">Messages clients send from their dashboard land here.</p>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {data.messages.map((m) => {
              const c = byId.get(m.user_id);
              return (
                <li key={m.id}>
                  <button onClick={() => open(m.user_id)} className={cn("glass-inset w-full rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/[0.05] cursor-pointer", !m.read_by_owner && "border-yellow-300/30")}>
                    <div className="flex items-center gap-2 text-[12px]">
                      {!m.read_by_owner && <span className="size-1.5 shrink-0 rounded-full bg-yellow-300" />}
                      <span className="truncate font-medium">{c?.company || c?.email || "Client"}</span>
                      <span className="ml-auto shrink-0 text-[10px] text-muted-foreground">{dt(m.created_at)}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[12px] text-white/70">{m.body}</p>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
      <section>
        <h2 className="text-[13px] font-medium">Email to contact@praz.ai</h2>
        {data.inbound.length === 0 ? (
          <p className="glass-inset mt-2 rounded-lg px-3 py-4 text-[12px] leading-relaxed text-muted-foreground">
            Incoming email shows here once forwarding is connected. The team copies of client messages, setup edits, plan changes and new-client
            details also arrive in that inbox.
          </p>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {data.inbound.map((e) => (
              <li key={e.id} className="glass-inset rounded-lg px-3 py-2 text-[12px]">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium">{String(e.detail.from ?? e.email ?? "Unknown sender")}</span>
                  <span className="ml-auto shrink-0 text-[10px] text-muted-foreground">{dt(e.created_at)}</span>
                </div>
                <p className="mt-0.5 truncate text-white/85">{String(e.detail.subject ?? "(no subject)")}</p>
                {e.detail.text ? <p className="mt-1 line-clamp-3 whitespace-pre-line text-white/65">{String(e.detail.text)}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

type Booking = { id: string; title: string; start: string; status: string; meetingUrl: string | null; attendee: { name?: string; email?: string } | null; notes: string | null };

function Meetings() {
  const [list, setList] = useState<Booking[] | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    api<{ meetings: Booking[] }>("/api/owner/meetings").then((d) => setList(d.meetings)).catch((e) => setError(e.message));
  }, []);
  if (error) return <p className="glass-inset rounded-lg px-3 py-4 text-[12px] text-red-200">{error}</p>;
  if (!list) return <p className="flex items-center gap-2 text-[12px] text-muted-foreground"><Loader2 className="size-3.5 animate-spin" /> Loading calls from Cal.com…</p>;
  if (list.length === 0) return <p className="glass-inset rounded-lg px-3 py-4 text-center text-[12px] text-muted-foreground">No upcoming calls booked.</p>;
  return (
    <ul className="space-y-1.5">
      {list.map((b) => (
        <li key={b.id} className="glass-inset flex flex-wrap items-center gap-3 rounded-lg px-3 py-2.5 text-[12px]">
          <span className="w-44 shrink-0 font-medium tabular-nums">{new Date(b.start).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-white/90">{b.attendee?.name ?? b.title}</span>
            <span className="block truncate text-[11px] text-muted-foreground">{[b.attendee?.email, b.notes].filter(Boolean).join(" · ")}</span>
          </span>
          {b.meetingUrl && /^https?:/.test(b.meetingUrl) && (
            <a href={b.meetingUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-white/70 hover:text-white">
              Join <ArrowUpRight className="size-3" />
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Client detail                                                       */
/* ------------------------------------------------------------------ */

const SETUP_FIELDS: [string, string][] = [
  ["company", "Company"],
  ["website", "Website"],
  ["offer", "What they sell"],
  ["dealSize", "Deal size / LTV"],
  ["icp", "Ideal customer"],
  ["titles", "Job titles"],
  ["industries", "Industries"],
  ["companySize", "Company size"],
  ["locations", "Locations"],
  ["problem", "Problem solved"],
  ["proof", "Proof"],
  ["cta", "Offer to prospects"],
  ["senderName", "Sender name"],
  ["senderTitle", "Sender title"],
  ["domainStyle", "Domain preferences"],
  ["address", "Business address"],
  ["goal", "Goal"],
  ["phone", "Phone"],
  ["hours", "Call hours"],
  ["calendar", "Booking link"],
  ["email", "Forwarding email"],
  ["landingPage", "Website page"],
  ["dailyVolume", "Daily volume (at signup)"],
  ["approval", "Copy approval"],
];

function ClientDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const [d, setD] = useState<Detail | null>(null);
  const [error, setError] = useState("");
  const load = useCallback(() => {
    api<Detail>(`/api/owner/client?id=${encodeURIComponent(id)}`).then(setD).catch((e) => setError(e.message));
  }, [id]);
  useEffect(load, [load]);

  // Opening a client marks their messages as read.
  useEffect(() => {
    if (d?.messages.some((m) => m.sender === "client" && !m.read_by_owner)) {
      api("/api/owner/client", { method: "POST", body: JSON.stringify({ action: "mark_read", userId: id }) }).catch(() => {});
    }
  }, [d, id]);

  const act = useCallback(
    async (body: Record<string, unknown>) => {
      await api("/api/owner/client", { method: "POST", body: JSON.stringify({ userId: id, ...body }) });
      load();
    },
    [id, load]
  );

  if (error) return <p className="mt-8 text-[12px] text-red-200">{error}</p>;
  if (!d) return <p className="mt-8 flex items-center gap-2 text-[12px] text-muted-foreground"><Loader2 className="size-3.5 animate-spin" /> Loading client…</p>;

  const setup = d.setup ?? {};
  const st = planStatus(d.subscription);
  const planEvents = d.events.filter((e) => e.type !== "setup_updated");

  return (
    <div className="mt-6">
      <button onClick={onBack} className="flex items-center gap-1 text-[12px] text-white/70 hover:text-white cursor-pointer">
        <ArrowLeft className="size-3.5" /> All clients
      </button>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h2 className="text-[20px] font-medium tracking-[-0.02em]">{String(setup.company || d.user.email)}</h2>
        <span className={cn("rounded px-1.5 py-px text-[10px] font-medium", st.tone)}>{st.label}</span>
      </div>
      <p className="mt-1 text-[12px] text-muted-foreground">
        {d.user.email} · joined {dt(d.user.createdAt)} · {d.user.confirmed ? "email confirmed" : "email not confirmed"}
        {d.user.lastSignInAt && ` · last login ${dt(d.user.lastSignInAt)}`}
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Plan & status">
          {d.subscription ? (
            <dl className="grid grid-cols-2 gap-3 text-[12px]">
              <Fact label="Plan" value={d.subscription.volume ? `${int(d.subscription.volume)} emails/day` : "Custom"} />
              <Fact label="Price" value={`${usd(d.subscription.amount)}/mo`} />
              <Fact label={d.subscription.cancelAtPeriodEnd ? "Ends" : "Renews"} value={d.subscription.currentPeriodEnd ? day(d.subscription.currentPeriodEnd) : "—"} />
              <Fact label="Card" value={d.subscription.card ? `${d.subscription.card.brand.toUpperCase()} ···· ${d.subscription.card.last4}` : "—"} />
            </dl>
          ) : (
            <p className="text-[12px] text-muted-foreground">No subscription yet.</p>
          )}
          <p className="mt-4 text-[11px] font-medium text-white/80">History</p>
          {planEvents.length === 0 ? (
            <p className="mt-1 text-[12px] text-muted-foreground">No plan changes yet.</p>
          ) : (
            <ul className="mt-1.5 space-y-1">
              {planEvents.map((e) => (
                <li key={e.id} className="flex items-center gap-2 text-[12px]">
                  <span className={cn("rounded px-1.5 py-px text-[10px] font-medium", eventTone(e.type))}>{eventLabel(e)}</span>
                  <span className="ml-auto text-[11px] text-muted-foreground">{dt(e.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
          {d.user.termsAcceptedAt && (
            <p className="mt-4 text-[11px] text-muted-foreground">Accepted Terms v{d.user.termsVersion} on {dt(d.user.termsAcceptedAt)}</p>
          )}
        </Panel>

        <Panel title="Onboarding details">
          {!d.setup ? (
            <p className="text-[12px] text-muted-foreground">They haven&apos;t finished onboarding.</p>
          ) : (
            <dl className="space-y-1.5 text-[12px]">
              {SETUP_FIELDS.filter(([k]) => setup[k] !== undefined && String(setup[k]).trim() !== "").map(([k, label]) => (
                <div key={k} className="grid grid-cols-[120px_1fr] gap-3">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="min-w-0 whitespace-pre-line break-words text-white/85">
                    {k === "goal" ? goalLabel[setup[k] as Goal] ?? String(setup[k]) : k === "dealSize" ? usd(Number(setup[k])) : String(setup[k])}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </Panel>
      </div>

      <h3 className="mt-10 text-[14px] font-medium">Their dashboard</h3>
      <p className="mt-0.5 text-[12px] text-muted-foreground">Everything you enter here appears on the client&apos;s dashboard right away.</p>
      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <SettingsForm settings={d.settings} onSave={(s) => act({ action: "settings", ...s })} />
        <StatsForm stats={d.stats} act={act} />
        <RepliesForm rows={d.replies} act={act} />
        <CallsForm rows={d.calls} act={act} />
        <MeetingsForm rows={d.meetings} act={act} />
        <Thread id={id} messages={d.messages} onSent={load} />
      </div>
    </div>
  );
}

function Panel({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("glass rounded-xl p-4", className)}>
      <h3 className="mb-3 text-[13px] font-medium">{title}</h3>
      {children}
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 truncate font-medium tabular-nums">{value}</dd>
    </div>
  );
}

function useSubmit(fn: () => Promise<void>) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const run = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      await fn();
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return { busy, error, saved, run };
}

function SaveRow({ busy, error, saved, label = "Save" }: { busy: boolean; error: string; saved: boolean; label?: string }) {
  return (
    <div className="flex items-center gap-3">
      <button type="submit" disabled={busy} className="flex h-8 items-center rounded-md bg-white px-3.5 text-[12px] font-medium text-zinc-950 hover:bg-white/90 disabled:opacity-60 cursor-pointer">
        {busy ? <Loader2 className="size-3.5 animate-spin" /> : label}
      </button>
      <AnimatePresence>{saved && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[11px] text-yellow-100">Saved</motion.span>}</AnimatePresence>
      {error && <span className="text-[11px] text-red-200">{error}</span>}
    </div>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-[11px]">{label}</Label>
      {children}
    </div>
  );
}

const inputCls = "h-8 text-[12px]";

function SettingsForm({ settings, onSave }: { settings: Detail["settings"]; onSave: (s: { operator_name: string; operator_note: string; campaign_live: boolean }) => Promise<void> }) {
  const [name, setName] = useState(settings?.operator_name ?? "");
  const [note, setNote] = useState(settings?.operator_note ?? "");
  const [liveOn, setLiveOn] = useState(settings?.campaign_live ?? false);
  const s = useSubmit(() => onSave({ operator_name: name, operator_note: note, campaign_live: liveOn }));
  return (
    <Panel title="Operator & status">
      <form onSubmit={s.run} className="space-y-3">
        <Field id="op-name" label="Operator name shown to the client">
          <Input id="op-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex M." className={inputCls} />
        </Field>
        <Field id="op-note" label="Weekly note (top of their message thread)">
          <Textarea id="op-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="This week we launched…" className="min-h-16 text-[12px]" />
        </Field>
        <label className="flex cursor-pointer items-center gap-2 text-[12px] text-white/85">
          <input type="checkbox" checked={liveOn} onChange={(e) => setLiveOn(e.target.checked)} className="size-3.5 accent-yellow-300" />
          Campaign is live (shows &ldquo;Campaign live&rdquo; instead of &ldquo;Setting up&rdquo;)
        </label>
        <SaveRow {...s} />
      </form>
    </Panel>
  );
}

const STAT_KEYS = ["sent", "replies", "positive", "calls", "answered", "meetings"] as const;

function StatsForm({ stats, act }: { stats: Detail["stats"]; act: (b: Record<string, unknown>) => Promise<void> }) {
  const [dayV, setDay] = useState(today());
  const existing = useMemo(() => stats.find((r) => r.day === dayV), [stats, dayV]);
  const [vals, setVals] = useState<Record<string, string>>({});
  useEffect(() => {
    setVals(Object.fromEntries(STAT_KEYS.map((k) => [k, existing ? String(existing[k]) : ""])));
  }, [existing]);
  const [bulk, setBulk] = useState("");
  const one = useSubmit(() => act({ action: "stats", day: dayV, ...vals }));
  const many = useSubmit(async () => {
    const rows = bulk
      .split(/\n+/)
      .map((l) => l.split(/[,\t]/).map((x) => x.trim()))
      .filter((p) => /^\d{4}-\d{2}-\d{2}$/.test(p[0] ?? ""))
      .map(([d, ...n]) => Object.fromEntries([["day", d], ...STAT_KEYS.map((k, i) => [k, n[i] ?? 0])]));
    if (!rows.length) throw new Error("Paste lines like 2026-10-28,1000,12,1,1,1,0");
    await act({ action: "stats_bulk", rows });
    setBulk("");
  });
  const recent = stats.slice(0, 10);
  return (
    <Panel title="Daily numbers">
      <form onSubmit={one.run} className="space-y-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Field id="st-day" label="Date">
            <Input id="st-day" type="date" value={dayV} onChange={(e) => setDay(e.target.value)} className={inputCls} />
          </Field>
          {STAT_KEYS.map((k) => (
            <Field key={k} id={`st-${k}`} label={k === "positive" ? "Positive replies" : k === "answered" ? "Calls answered" : k[0].toUpperCase() + k.slice(1)}>
              <Input id={`st-${k}`} type="number" min={0} value={vals[k] ?? ""} onChange={(e) => setVals((v) => ({ ...v, [k]: e.target.value }))} className={inputCls} />
            </Field>
          ))}
        </div>
        <SaveRow {...one} label={existing ? "Update day" : "Save day"} />
      </form>
      <details className="mt-4 text-[12px]">
        <summary className="cursor-pointer text-white/75">Paste many days at once</summary>
        <form onSubmit={many.run} className="mt-2 space-y-2">
          <p className="text-[11px] text-muted-foreground">One day per line: date, sent, replies, positive, calls, answered, meetings. Copying columns from a spreadsheet works too.</p>
          <Textarea value={bulk} onChange={(e) => setBulk(e.target.value)} placeholder={"2026-10-27,1000,11,1,1,1,0\n2026-10-28,1000,14,2,1,0,1"} className="min-h-20 font-mono text-[11px]" aria-label="Paste daily numbers" />
          <SaveRow {...many} label="Import" />
        </form>
      </details>
      {recent.length > 0 && (
        <table className="mt-4 w-full text-[11px] tabular-nums">
          <thead className="text-muted-foreground">
            <tr>
              <th className="py-1 text-left font-normal">Day</th>
              {["Sent", "Rep.", "Pos.", "Calls", "Ans.", "Mtg."].map((h) => <th key={h} className="py-1 text-right font-normal">{h}</th>)}
              <th />
            </tr>
          </thead>
          <tbody>
            {recent.map((r) => (
              <tr key={r.day} className="border-t border-white/[0.04]">
                <td className="py-1"><button onClick={() => setDay(r.day)} className="hover:text-white cursor-pointer">{r.day}</button></td>
                {STAT_KEYS.map((k) => <td key={k} className="py-1 text-right text-white/80">{int(r[k])}</td>)}
                <td className="py-1 text-right">
                  <button aria-label={`Delete ${r.day}`} onClick={() => act({ action: "delete", table: "daily_stats", day: r.day })} className="text-white/30 hover:text-red-300 cursor-pointer"><Trash2 className="size-3" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Panel>
  );
}

function ListWithDelete<T extends { id: string }>({ rows, table, act, render }: { rows: T[]; table: string; act: (b: Record<string, unknown>) => Promise<void>; render: (r: T) => React.ReactNode }) {
  if (!rows.length) return null;
  return (
    <ul className="mt-4 space-y-1.5">
      {rows.slice(0, 15).map((r) => (
        <li key={r.id} className="glass-inset flex items-start gap-2 rounded-md px-2.5 py-2 text-[12px]">
          <div className="min-w-0 flex-1">{render(r)}</div>
          <button aria-label="Delete" onClick={() => act({ action: "delete", table, id: r.id })} className="mt-0.5 text-white/30 hover:text-red-300 cursor-pointer"><Trash2 className="size-3" /></button>
        </li>
      ))}
    </ul>
  );
}

function RepliesForm({ rows, act }: { rows: Detail["replies"]; act: (b: Record<string, unknown>) => Promise<void> }) {
  const empty = { name: "", title: "", company: "", message: "", received_at: "" };
  const [f, setF] = useState(empty);
  const s = useSubmit(async () => {
    await act({ action: "reply", ...f, received_at: iso(f.received_at) });
    setF(empty);
  });
  return (
    <Panel title="Positive replies">
      <form onSubmit={s.run} className="space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Name" aria-label="Name" className={inputCls} />
          <Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Title" aria-label="Title" className={inputCls} />
          <Input value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} placeholder="Company" aria-label="Company" className={inputCls} />
        </div>
        <Textarea value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} placeholder="Their reply" aria-label="Reply" className="min-h-14 text-[12px]" />
        <div className="flex flex-wrap items-center gap-2">
          <Input type="datetime-local" value={f.received_at} onChange={(e) => setF({ ...f, received_at: e.target.value })} aria-label="Received at (optional)" className={cn(inputCls, "w-auto")} />
          <SaveRow {...s} label="Add reply" />
        </div>
      </form>
      <ListWithDelete rows={rows} table="positive_replies" act={act} render={(r) => (
        <>
          <p className="font-medium">{r.name} <span className="font-normal text-muted-foreground">{[r.title, r.company].filter(Boolean).join(" · ")} · {dt(r.received_at)}</span></p>
          <p className="mt-0.5 text-white/70">&ldquo;{r.message}&rdquo;</p>
        </>
      )} />
    </Panel>
  );
}

function CallsForm({ rows, act }: { rows: Detail["calls"]; act: (b: Record<string, unknown>) => Promise<void> }) {
  const empty = { from_number: "", location: "", called_at: "", minutes: "", status: "Answered" };
  const [f, setF] = useState(empty);
  const s = useSubmit(async () => {
    await act({ action: "call", ...f, called_at: iso(f.called_at), duration_seconds: f.minutes === "" ? "" : Math.round(Number(f.minutes) * 60) });
    setF(empty);
  });
  return (
    <Panel title="Tracked calls">
      <form onSubmit={s.run} className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Input value={f.from_number} onChange={(e) => setF({ ...f, from_number: e.target.value })} placeholder="Caller number" aria-label="Caller number" className={inputCls} />
          <Input value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} placeholder="City, State" aria-label="Location" className={inputCls} />
          <Input type="datetime-local" value={f.called_at} onChange={(e) => setF({ ...f, called_at: e.target.value })} aria-label="Call time" className={inputCls} />
          <Input type="number" min={0} step="0.1" value={f.minutes} onChange={(e) => setF({ ...f, minutes: e.target.value })} placeholder="Minutes" aria-label="Duration in minutes" className={inputCls} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })} aria-label="Call status" className="h-8 rounded-md border border-white/10 bg-white/[0.03] px-2 text-[12px] text-white">
            {["Answered", "Missed", "Voicemail"].map((o) => <option key={o} className="bg-zinc-900">{o}</option>)}
          </select>
          <SaveRow {...s} label="Add call" />
        </div>
      </form>
      <ListWithDelete rows={rows} table="tracked_calls" act={act} render={(r) => (
        <p><span className="font-medium tabular-nums">{r.from_number}</span> <span className="text-muted-foreground">{[r.location, dt(r.called_at), r.status, r.duration_seconds != null ? `${Math.round(r.duration_seconds / 60)}m` : null].filter(Boolean).join(" · ")}</span></p>
      )} />
    </Panel>
  );
}

function MeetingsForm({ rows, act }: { rows: Detail["meetings"]; act: (b: Record<string, unknown>) => Promise<void> }) {
  const empty = { name: "", company: "", starts_at: "" };
  const [f, setF] = useState(empty);
  const s = useSubmit(async () => {
    await act({ action: "meeting", ...f, starts_at: iso(f.starts_at) });
    setF(empty);
  });
  return (
    <Panel title="Meetings booked for them">
      <form onSubmit={s.run} className="space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Name" aria-label="Meeting with" className={inputCls} />
          <Input value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} placeholder="Company" aria-label="Company" className={inputCls} />
          <Input type="datetime-local" value={f.starts_at} onChange={(e) => setF({ ...f, starts_at: e.target.value })} aria-label="Meeting time" className={inputCls} />
        </div>
        <SaveRow {...s} label="Add meeting" />
      </form>
      <ListWithDelete rows={rows} table="client_meetings" act={act} render={(r) => (
        <p><span className="font-medium">{r.name}</span> <span className="text-muted-foreground">{[r.company, dt(r.starts_at)].filter(Boolean).join(" · ")}</span></p>
      )} />
    </Panel>
  );
}

function Thread({ id, messages, onSent }: { id: string; messages: Msg[]; onSent: () => void }) {
  const [text, setText] = useState("");
  const s = useSubmit(async () => {
    if (!text.trim()) throw new Error("Write a reply first.");
    await api("/api/owner/reply", { method: "POST", body: JSON.stringify({ userId: id, body: text }) });
    setText("");
    onSent();
  });
  return (
    <Panel title="Messages">
      {messages.length === 0 ? (
        <p className="text-[12px] text-muted-foreground">No messages yet.</p>
      ) : (
        <ul className="max-h-80 space-y-2 overflow-y-auto pr-1">
          {messages.map((m) => (
            <li key={m.id} className={cn("flex", m.sender === "operator" ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[85%] rounded-lg px-3 py-2", m.sender === "operator" ? "bg-yellow-300/[0.12]" : "glass-inset")}>
                <p className="whitespace-pre-line text-[12px] leading-relaxed text-white/90">{m.body}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">{m.sender === "operator" ? "You" : "Client"} · {dt(m.created_at)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={s.run} className="mt-3 space-y-2">
        <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Reply — they see it in their dashboard and get it by email" aria-label="Reply to client" className="min-h-16 text-[12px]" />
        <SaveRow {...s} label="Send reply" />
      </form>
    </Panel>
  );
}
