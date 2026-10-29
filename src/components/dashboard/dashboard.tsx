"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUpRight,
  CalendarCheck,
  CalendarDays,
  CreditCard,
  Globe,
  Link,
  Loader2,
  LogOut,
  Mail,
  Pencil,
  Phone,
  PhoneIncoming,
  Send,
  Settings,
  Target,
  UserRound,
} from "lucide-react";
import { LogoMark } from "@/components/logo";
import { AnimatedNumber } from "@/components/animated-number";
import { GoalDetails, GoalPicker, VolumePicker } from "@/components/onboarding/onboarding";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { calls, days as sampleDays, emptyDays, meetings, operator, positiveReplies, totals, type Call, type Day } from "@/lib/dashboard-data";
import { destinationValid, emptySetup, goalLabel, loadSetup, sampleSetup, saveSetup, type Goal, type Setup } from "@/lib/setup";
import { legal } from "@/lib/legal";
import { pricing, site, type Volume } from "@/lib/site";
import { authConfigured, authedFetch, currentEmail, loadSetupFromAccount, saveSetupToAccount, signOut } from "@/lib/auth";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;
const fade = (delay: number) => ({
  initial: { opacity: 0, y: 8, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 0.7, delay, ease },
});

const int = (n: number) => Math.round(n).toLocaleString("en-US");
const usd = (n: number) => "$" + int(n);
const usd2 = (n: number) => "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pct = (n: number) => (Math.round(n * 10) / 10).toFixed(1) + "%";
const date = (unix: number) => new Date(unix * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const RANGES = [7, 30, 90, 180] as const;
type Range = (typeof RANGES)[number];

type Message = { from: "operator" | "you"; text: string; when: string };
const MESSAGES_KEY = "praz:messages";

// Real accounts see their own (empty until launch) data; the static design preview shows samples.
const live = authConfigured;

type Subscription = {
  id: string;
  status: string;
  volume: Volume | null;
  amount: number;
  currentPeriodEnd: number | null;
  cancelAtPeriodEnd: boolean;
  cancelAt: number | null;
  card: { brand: string; last4: string } | null;
  pendingUpdate: boolean;
};

type LiveData = {
  stats: (Omit<Day, "date"> & { day: string })[];
  replies: { id: string; name: string; title: string | null; company: string | null; message: string; received_at: string }[];
  calls: { id: string; from_number: string; location: string | null; called_at: string; duration_seconds: number | null; status: Call["status"] }[];
  meetings: { id: string; name: string; company: string | null; starts_at: string }[];
  settings: { operator_name: string | null; operator_note: string | null; campaign_live: boolean } | null;
};

const ago = (iso: string) => {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  if (mins < 1440) return `${Math.round(mins / 60)}h ago`;
  if (mins < 2880) return "Yesterday";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};
const when = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
const duration = (sec: number | null) => (sec == null ? "—" : `${Math.floor(sec / 60)}m ${String(sec % 60).padStart(2, "0")}s`);

/** The six-month calendar with whatever days the owner has filled in. */
function mergeStats(rows: LiveData["stats"]): Day[] {
  const byDay = new Map(rows.map((r) => [r.day, r]));
  return emptyDays().map((d) => {
    const r = byDay.get(d.date);
    return r ? { date: d.date, sent: r.sent, replies: r.replies, positive: r.positive, calls: r.calls, answered: r.answered, meetings: r.meetings } : d;
  });
}

const sampleSubscription: Subscription = {
  id: "sub_sample",
  status: "active",
  volume: 1000,
  amount: pricing[1000],
  currentPeriodEnd: Math.floor(Date.UTC(2026, 10, 21) / 1000),
  cancelAtPeriodEnd: false,
  cancelAt: null,
  card: { brand: "visa", last4: "4242" },
  pendingUpdate: false,
};

export function Dashboard() {
  const [setup, setSetup] = useState<Setup>(live ? emptySetup : sampleSetup);
  const [range, setRange] = useState<Range>(30);
  const [editing, setEditing] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [sub, setSub] = useState<Subscription | null | "loading">(live ? "loading" : sampleSubscription);
  const [data, setData] = useState<LiveData | null>(null);

  const loadPlan = useCallback(async () => {
    if (!live) return;
    try {
      const res = await authedFetch("/api/billing");
      const data = await res.json();
      setSub(res.ok ? data.subscription : null);
    } catch {
      setSub(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const email = await currentEmail();
      if (live && !email) {
        window.location.href = site.loginUrl;
        return;
      }
      setAccount(email);
      const fromAccount = await loadSetupFromAccount();
      const local = loadSetup();
      // Answers saved before the email was confirmed only exist in this browser; copy them to the account.
      if (!fromAccount && local) saveSetupToAccount(local);
      const saved = fromAccount ? { ...emptySetup, ...fromAccount } : local;
      if (saved) setSetup(live && email ? { ...saved, accountEmail: email } : saved);
      else if (live && email) setSetup({ ...emptySetup, accountEmail: email });
      loadPlan();
      if (live) {
        authedFetch("/api/dashboard")
          .then((r) => (r.ok ? r.json() : null))
          .then((d) => d && setData(d))
          .catch(() => {});
      }
    })();
  }, [loadPlan]);

  const update = (next: Setup) => {
    setSetup(next);
    saveSetup(next);
    saveSetupToAccount(next);
    if (live) authedFetch("/api/notify", { method: "POST", body: JSON.stringify({ kind: "setup", setup: next }) }).catch(() => {});
  };

  const plan = sub && sub !== "loading" ? sub : null;
  const volume: Volume = plan?.volume ?? setup.dailyVolume;
  const goal = setup.goal;
  // Calls and meetings are tracked outcomes; website and inbox goals end at the positive reply.
  const tracked = goal === "call" || goal === "book";
  const price = plan?.amount ?? pricing[volume];
  const series = useMemo(() => (live ? mergeStats(data?.stats ?? []) : sampleDays), [data]);
  const t = useMemo(() => totals(series.slice(-range)), [series, range]);
  const cost = price * (range / 30);
  const hasData = t.sent > 0;

  const stats = [
    { k: t.sent, v: "Emails sent", f: int },
    { k: t.replies, v: "Total replies", f: int },
    { k: t.positive, v: "Positive replies", f: int, accent: true },
    goal === "call"
      ? { k: t.calls, v: "Tracked calls", f: int }
      : goal === "book"
        ? { k: t.meetings, v: "Meetings booked", f: int }
        : { k: t.replies ? (t.positive / t.replies) * 100 : 0, v: "Positive rate", f: pct },
    { k: t.positive ? cost / t.positive : 0, v: "Cost per positive", f: t.positive ? usd : () => "—" },
  ];

  const status = !plan
    ? { label: sub === "loading" ? "Loading…" : "No active plan", dot: "bg-white/30", ping: false }
    : plan.status === "past_due" || plan.status === "unpaid"
      ? { label: "Payment issue · update your card", dot: "bg-red-400", ping: false }
      : plan.cancelAtPeriodEnd
        ? { label: `Ends ${plan.currentPeriodEnd ? date(plan.currentPeriodEnd) : "soon"}`, dot: "bg-white/40", ping: false }
        : hasData || data?.settings?.campaign_live
          ? { label: `Campaign live · ${int(volume)}/day`, dot: "bg-yellow-300", ping: true }
          : { label: `Setting up · ${int(volume)}/day`, dot: "bg-yellow-300", ping: true };

  const operatorName = live ? data?.settings?.operator_name || "your operator" : operator.name;

  return (
    <div className="relative flex min-h-svh flex-col">
      <TopBar account={account} />

      <div className="mx-auto flex w-full max-w-[680px] flex-1 flex-col px-4 pb-16 pt-12 md:pt-16">
        {/* identity */}
        <div className="flex flex-col items-center text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease }}>
            <LogoMark className="size-14 text-white" />
          </motion.div>
          <motion.h1 {...fade(0.1)} className="mt-5 text-[22px] font-medium tracking-[-0.02em] md:text-[24px]">
            {setup.company || "Your company"}
          </motion.h1>
          <motion.p {...fade(0.18)} className="mt-1.5 flex flex-wrap items-center justify-center gap-2 text-[12px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="relative flex size-1.5">
                {status.ping && <span className={cn("absolute inline-flex size-full animate-ping rounded-full opacity-60", status.dot)} />}
                <span className={cn("relative inline-flex size-1.5 rounded-full", status.dot)} />
              </span>
              {status.label}
            </span>
            <span className="text-white/20">·</span>
            <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-white/70">Goal: {goalLabel[goal].toLowerCase()}</span>
          </motion.p>
        </div>

        {live && !hasData && !data?.settings?.campaign_live && plan && (
          <motion.div {...fade(0.22)} className="glass-inset mt-8 rounded-xl px-4 py-3 text-[12px] leading-relaxed text-white/80">
            <span className="font-medium text-white">Your campaign is being built.</span> We&apos;re sourcing your lead list, setting up and
            warming your inboxes, and writing your sequences. Results show up here as soon as sending starts, usually within 3 days.
          </motion.div>
        )}
        {live && sub !== "loading" && !plan && (
          <motion.div {...fade(0.22)} className="glass-inset mt-8 rounded-xl px-4 py-3 text-[12px] leading-relaxed text-white/80">
            <span className="font-medium text-white">No active subscription on this account.</span> If you just paid, refresh in a
            minute. Otherwise{" "}
            <a href={site.onboardingUrl} className="text-white underline underline-offset-4">
              finish onboarding
            </a>{" "}
            or email <span className="text-white">{legal.supportEmail}</span>.
          </motion.div>
        )}

        {/* range + stats */}
        <motion.div {...fade(0.26)} className="mt-8">
          <div className="mb-2.5 flex justify-center">
            <Segmented value={range} options={RANGES.map((r) => ({ value: r, label: `${r}d` }))} onChange={setRange} layoutId="range-pill" />
          </div>
          <dl className="glass grid grid-cols-2 rounded-xl py-1 sm:grid-cols-5">
            {stats.map((s, i) => (
              <div
                key={s.v}
                className={cn(
                  "flex flex-col items-center px-2 py-2.5 text-center",
                  i > 0 && "sm:border-l sm:border-white/[0.06]",
                  i === stats.length - 1 && "max-sm:col-span-2"
                )}
              >
                <dt className={cn("text-[13px] font-medium tabular-nums", s.accent && "text-yellow-200")}>
                  <AnimatedNumber value={s.k} format={s.f} />
                </dt>
                <dd className="mt-0.5 text-[11px] text-muted-foreground">{s.v}</dd>
              </div>
            ))}
          </dl>
        </motion.div>

        <motion.div {...fade(0.34)} className="mt-10">
          <Activity goal={goal} data={series} />
        </motion.div>

        <motion.div {...fade(0.42)} className={cn("mt-10 grid gap-8", tracked && "sm:grid-cols-2")}>
          <section>
            <SectionTitle aside={goal === "inbox" ? `forwarded to ${setup.email}` : goal === "website" ? `sent to ${setup.landingPage}` : undefined}>
              Latest positive replies
            </SectionTitle>
            {live && !data?.replies.length ? (
              <Empty>Interested replies appear here the moment they come in.</Empty>
            ) : (
              <ul className={cn("mt-2 grid gap-1.5", !tracked && "sm:grid-cols-2")}>
                {(live
                  ? data!.replies.map((r) => ({ key: r.id, name: r.name, title: r.title ?? "", company: r.company ?? "", message: r.message, when: ago(r.received_at) }))
                  : positiveReplies.map((r) => ({ key: r.name, ...r }))
                ).map((r) => (
                  <li key={r.key} className="glass-inset rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2 text-[12px]">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-white/[0.06] text-[9px] font-medium">{r.name[0]}</span>
                      <span className="truncate font-medium">{r.name}</span>
                      <span className="truncate text-[11px] text-muted-foreground">
                        {[r.title, r.company].filter(Boolean).join(" · ")}
                      </span>
                      <span className="ml-auto shrink-0 text-[10px] text-muted-foreground">{r.when}</span>
                    </div>
                    <p className="mt-1 pl-7 text-[12px] text-white/70">“{r.message}”</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {goal === "call" && (
            <section>
              <SectionTitle aside="via CallRail">Tracked calls</SectionTitle>
              {live && !data?.calls.length ? (
                <Empty>Calls from interested buyers to {setup.phone || "your number"} are logged here.</Empty>
              ) : (
                <>
                  <dl className="mt-2">
                    {(live
                      ? data!.calls.map((c) => ({ from: c.from_number, location: c.location ?? "", when: when(c.called_at), duration: duration(c.duration_seconds), status: c.status, key: c.id }))
                      : calls.map((c) => ({ ...c, key: c.from }))
                    ).map((c) => (
                      <Row
                        key={c.key}
                        icon={PhoneIncoming}
                        label={c.from}
                        sub={[c.location, c.when].filter(Boolean).join(" · ")}
                        value={
                          <span className="flex items-center gap-2">
                            <span className="text-muted-foreground">{c.duration}</span>
                            <CallStatus status={c.status} />
                          </span>
                        }
                      />
                    ))}
                  </dl>
                  <Summary label="Answered" value={`${int(t.answered)} of ${int(t.calls)}`} />
                </>
              )}
            </section>
          )}

          {goal === "book" && (
            <section>
              <SectionTitle aside={setup.calendar}>Upcoming meetings</SectionTitle>
              {live && !data?.meetings.length ? (
                <Empty>Meetings buyers book on your calendar show up here.</Empty>
              ) : (
                <>
                  <dl className="mt-2">
                    {(live
                      ? data!.meetings.map((m) => ({ key: m.id, name: m.name, company: m.company ?? "", when: when(m.starts_at) }))
                      : meetings.map((m) => ({ key: m.name, ...m }))
                    ).map((m) => (
                      <Row key={m.key} icon={CalendarCheck} label={m.name} sub={m.company} value={<span className="text-muted-foreground">{m.when}</span>} />
                    ))}
                  </dl>
                  <Summary label="Booked this period" value={int(t.meetings)} />
                </>
              )}
            </section>
          )}
        </motion.div>

        <motion.div {...fade(0.5)} className="mt-10 grid gap-8 sm:grid-cols-2">
          <section>
            <SectionTitle>Campaign health</SectionTitle>
            <dl className="mt-2">
              <Row label="Reply rate" value={hasData ? pct((t.replies / t.sent) * 100) : "—"} />
              <Row label="Positive rate" sub="of replies" value={t.replies ? pct((t.positive / t.replies) * 100) : "—"} />
              {goal === "call" && <Row label="Positive replies that called" value={t.positive ? pct((t.calls / t.positive) * 100) : "—"} />}
              {goal === "call" && <Row label="Calls answered" value={t.calls ? pct((t.answered / t.calls) * 100) : "—"} />}
              {goal === "book" && <Row label="Positive replies that booked" value={t.positive ? pct((t.meetings / t.positive) * 100) : "—"} />}
            </dl>
          </section>

          <section id="settings">
            <div className="flex items-center justify-between">
              <SectionTitle>Your setup</SectionTitle>
              <button
                onClick={() => setEditing(true)}
                aria-label="Edit your setup"
                className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] text-muted-foreground transition-colors hover:bg-white/[0.05] hover:text-white cursor-pointer"
              >
                <Pencil className="size-3" /> Edit
              </button>
            </div>
            <dl className="mt-2">
              <Row icon={Target} label="Goal" value={goalLabel[goal]} />
              {goal === "call" && <Row icon={Phone} label="Forwarding number" value={setup.phone || "—"} />}
              {goal === "book" && <Row icon={CalendarDays} label="Booking link" value={setup.calendar || "—"} />}
              {goal === "website" && <Row icon={Link} label="Website page" value={setup.landingPage || "—"} />}
              {goal === "inbox" && <Row icon={Mail} label="Forwarding email" value={setup.email || "—"} />}
              <Row icon={UserRound} label="Your operator" value={live ? data?.settings?.operator_name || "Assigned at kickoff" : operator.name} />
            </dl>
            <div className="glass-inset mt-2 rounded-lg px-3 py-2">
              <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Globe className="size-3" /> Ideal customer
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-white/80">{setup.icp || "Not set yet."}</p>
            </div>
          </section>
        </motion.div>

        <motion.div {...fade(0.54)} className="mt-10">
          <PlanAndBilling
            sub={sub}
            onChanged={(next) => {
              setSub(next);
              // The plan-change route already tells the team, so just save locally.
              if (next.volume) {
                const saved = { ...setup, dailyVolume: next.volume };
                setSetup(saved);
                saveSetup(saved);
                saveSetupToAccount(saved);
              }
            }}
          />
        </motion.div>

        <motion.div {...fade(0.58)} className="mt-10">
          <OperatorThread operatorName={operatorName} note={live ? data?.settings?.operator_note ?? null : operator.note} />
        </motion.div>
      </div>

      <EditSetup open={editing} onOpenChange={setEditing} setup={setup} onSave={update} />
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="glass-inset mt-2 rounded-lg px-3 py-4 text-center text-[12px] text-muted-foreground">{children}</p>;
}

/* ------------------------------------------------------------------ */
/* Plan & billing                                                      */
/* ------------------------------------------------------------------ */

type Preview = { volume: Volume; monthly: number; dueNow: number; net: number; nextRenewal: number | null; prorationDate: number };

function PlanAndBilling({ sub, onChanged }: { sub: Subscription | null | "loading"; onChanged: (s: Subscription) => void }) {
  const plan = sub && sub !== "loading" ? sub : null;
  const [target, setTarget] = useState<Volume | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [state, setState] = useState<"idle" | "pricing" | "confirming" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [payUrl, setPayUrl] = useState<string | null>(null);
  const [portalBusy, setPortalBusy] = useState(false);

  const current = plan?.volume ?? null;
  const picked = target ?? current ?? 2000;
  const changing = !!plan && current !== null && picked !== current;

  // Price the change whenever a different volume is picked.
  useEffect(() => {
    setPreview(null);
    setError(null);
    setPayUrl(null);
    if (!changing) return;
    if (!live) {
      const diff = pricing[picked] - (current ? pricing[current] : 0);
      setPreview({ volume: picked, monthly: pricing[picked], dueNow: Math.max(0, diff * 0.8), net: diff * 0.8, nextRenewal: plan?.currentPeriodEnd ?? null, prorationDate: 0 });
      return;
    }
    let cancelled = false;
    setState("pricing");
    authedFetch("/api/billing/preview", { method: "POST", body: JSON.stringify({ volume: picked }) })
      .then(async (res) => {
        const data = await res.json();
        if (cancelled) return;
        if (res.ok) setPreview(data);
        else setError(data.error ?? "Couldn't price that change.");
      })
      .catch(() => !cancelled && setError("Couldn't price that change."))
      .finally(() => !cancelled && setState("idle"));
    return () => {
      cancelled = true;
    };
  }, [picked, changing, current, plan?.currentPeriodEnd]);

  const confirm = async () => {
    if (!preview) return;
    setState("confirming");
    setError(null);
    if (!live) {
      onChanged({ ...(plan as Subscription), volume: preview.volume, amount: preview.monthly });
      setTarget(null);
      setState("done");
      return;
    }
    try {
      const res = await authedFetch("/api/billing/change", {
        method: "POST",
        body: JSON.stringify({ volume: preview.volume, prorationDate: preview.prorationDate }),
      });
      const data = await res.json();
      if (res.ok) {
        onChanged(data.subscription);
        setTarget(null);
        setState("done");
      } else {
        setError(data.error ?? "Couldn't change your plan.");
        setPayUrl(data.payUrl ?? null);
        setState("idle");
      }
    } catch {
      setError("Couldn't change your plan. Please try again.");
      setState("idle");
    }
  };

  const openPortal = async () => {
    if (!live) return;
    setPortalBusy(true);
    try {
      const res = await authedFetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.url) window.location.href = data.url;
      else setError(data.error ?? "Couldn't open billing.");
    } catch {
      setError("Couldn't open billing.");
    } finally {
      setPortalBusy(false);
    }
  };

  const upgrade = !!preview && current !== null && preview.volume > current;

  return (
    <section id="billing" className="scroll-mt-6">
      <SectionTitle aside="billed monthly through Stripe">Plan &amp; billing</SectionTitle>
      <div className="glass mt-3 rounded-xl p-4">
        {sub === "loading" ? (
          <p className="flex items-center gap-2 text-[12px] text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" /> Loading your plan…
          </p>
        ) : !plan ? (
          <p className="text-[12px] text-muted-foreground">
            No active subscription. <a href={site.onboardingUrl} className="text-white underline underline-offset-4">Start one</a> to launch your campaign.
          </p>
        ) : (
          <>
            <dl className="grid grid-cols-2 gap-3 text-[12px] sm:grid-cols-4">
              <Fact label="Plan" value={current ? `${int(current)} emails/day` : "Custom"} />
              <Fact label="Price" value={`${usd(plan.amount)}/mo`} />
              <Fact
                label={plan.cancelAtPeriodEnd ? "Ends" : "Renews"}
                value={plan.currentPeriodEnd ? date(plan.currentPeriodEnd) : "—"}
              />
              <Fact label="Card" value={plan.card ? `${plan.card.brand.toUpperCase()} ···· ${plan.card.last4}` : "On file"} />
            </dl>

            <div className="glass-inset mt-4 rounded-lg p-4">
              <VolumePicker value={picked} onChange={(v) => setTarget(v)} />
              <AnimatePresence mode="wait" initial={false}>
                {state === "done" && !changing ? (
                  <motion.p key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-[12px] text-yellow-100">
                    Plan updated. Your operator has been told and will adjust sending.
                  </motion.p>
                ) : changing ? (
                  <motion.div
                    key={`change-${picked}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25, ease }}
                    className="mt-4 rounded-lg border border-yellow-300/25 bg-yellow-300/[0.06] p-3.5"
                  >
                    <p className="text-[13px] font-medium">
                      {picked > (current ?? 0) ? "Upgrade" : "Switch"} to {int(picked)} emails/day · {usd(pricing[picked])}/mo
                    </p>
                    {state === "pricing" || !preview ? (
                      <p className="mt-1.5 flex items-center gap-2 text-[12px] text-muted-foreground">
                        <Loader2 className="size-3 animate-spin" /> Working out today&apos;s amount…
                      </p>
                    ) : (
                      <p className="mt-1.5 text-[12px] leading-relaxed text-white/75">
                        {upgrade ? (
                          <>
                            You&apos;ll be charged <b className="font-medium text-white">{usd2(preview.dueNow)} today</b> for the rest of this
                            billing period, with credit for the unused time on your current plan. Then {usd(preview.monthly)}/mo from{" "}
                            {preview.nextRenewal ? date(preview.nextRenewal) : "your next renewal"}.
                          </>
                        ) : (
                          <>
                            Nothing to pay today. The unused time on your current plan becomes{" "}
                            <b className="font-medium text-white">{usd2(preview.net)} of credit</b> toward your next invoices. Then{" "}
                            {usd(preview.monthly)}/mo from {preview.nextRenewal ? date(preview.nextRenewal) : "your next renewal"}.
                          </>
                        )}{" "}
                        This replaces your current plan; you&apos;re never billed for both.
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button
                        onClick={confirm}
                        disabled={!preview || state !== "idle"}
                        className="flex h-8 items-center gap-1.5 rounded-md bg-white px-3.5 text-[12px] font-medium text-zinc-950 transition-all hover:bg-white/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-white/15 disabled:text-white/40 cursor-pointer"
                      >
                        {state === "confirming" ? <Loader2 className="size-3.5 animate-spin" /> : upgrade ? `Upgrade and pay ${preview ? usd2(preview.dueNow) : ""}` : "Confirm change"}
                      </button>
                      <button
                        onClick={() => setTarget(null)}
                        className="h-8 rounded-md px-3 text-[12px] text-white/70 transition-colors hover:bg-white/[0.05] hover:text-white cursor-pointer"
                      >
                        Keep current plan
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-[11px] text-muted-foreground">
                    Move the slider to change how many emails we send for you each day.
                  </motion.p>
                )}
              </AnimatePresence>
              {error && (
                <p className="mt-3 rounded-md bg-red-400/10 px-3 py-2 text-[12px] text-red-200">
                  {error}{" "}
                  {payUrl && (
                    <a href={payUrl} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                      Pay the invoice
                    </a>
                  )}
                </p>
              )}
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[11px] leading-relaxed text-muted-foreground sm:max-w-[60%]">
                Update your card, download invoices, or cancel. Cancelling stops renewal at the end of your current billing period;
                you keep full service until then.
              </p>
              <button
                onClick={openPortal}
                disabled={portalBusy}
                className="flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-3 text-[12px] text-white/85 transition-colors hover:bg-white/[0.08] hover:text-white disabled:opacity-60 cursor-pointer"
              >
                {portalBusy ? <Loader2 className="size-3.5 animate-spin" /> : <CreditCard className="size-3.5" />}
                Manage billing
                <ArrowUpRight className="size-3" />
              </button>
            </div>
          </>
        )}
      </div>
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

/* ------------------------------------------------------------------ */

function TopBar({ account }: { account: string | null }) {
  const link = "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] text-white/70 transition-colors hover:bg-white/[0.05] hover:text-white cursor-pointer";
  const logOut = async () => {
    await signOut();
    window.location.href = site.homeUrl;
  };
  const [owner, setOwner] = useState(false);
  useEffect(() => {
    if (account) authedFetch("/api/owner/me").then((r) => setOwner(r.ok)).catch(() => {});
  }, [account]);
  return (
    <motion.header {...fade(0)} className="flex items-center justify-between gap-3 px-4 py-3 md:px-5">
      <span className="flex min-w-0 items-baseline gap-2">
        <span className="text-[13px] font-medium text-white/90">Dashboard</span>
        {account && <span className="hidden truncate text-[11px] text-muted-foreground sm:inline">{account}</span>}
      </span>
      <nav className="flex items-center gap-1">
        {owner && (
          <a href={site.ownerUrl} className={link}>
            Owner suite
          </a>
        )}
        <a href="#settings" className={link}>
          <Settings className="size-3.5" /> Settings
        </a>
        {account && (
          <button onClick={logOut} className={link}>
            <LogOut className="size-3.5" /> Log out
          </button>
        )}
      </nav>
    </motion.header>
  );
}

function Segmented<T extends string | number>({
  value,
  options,
  onChange,
  layoutId,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  layoutId: string;
}) {
  return (
    <div className="flex items-center gap-0.5 text-[12px]">
      {options.map((o) => (
        <button
          key={String(o.value)}
          onClick={() => onChange(o.value)}
          className={cn(
            "relative rounded-md px-2 py-0.5 tabular-nums transition-colors cursor-pointer",
            o.value === value ? "text-white" : "text-muted-foreground hover:text-white/80"
          )}
        >
          {o.value === value && (
            <motion.span layoutId={layoutId} className="absolute inset-0 rounded-md bg-white/[0.07]" transition={{ type: "spring", stiffness: 420, damping: 34 }} />
          )}
          <span className="relative">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

type Metric = "replies" | "positive" | "outcome";

function Activity({ goal, data: days }: { goal: Goal; data: Day[] }) {
  const [metric, setMetric] = useState<Metric>("positive");
  const tracked = goal === "call" || goal === "book";
  const shown: Metric = !tracked && metric === "outcome" ? "positive" : metric;
  const outcome = goal === "call" ? "calls" : "meetings";
  const key: keyof Day = shown === "outcome" ? outcome : shown;
  const label = shown === "outcome" ? outcome : shown === "positive" ? "positive replies" : "replies";

  // Pad the start so columns are whole weeks (Sun → Sat).
  const first = new Date(days[0].date + "T00:00:00Z").getUTCDay();
  const cells: (Day | null)[] = [...Array(first).fill(null), ...days];
  const weeks: (Day | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const max = Math.max(1, ...days.map((d) => d[key] as number));
  const level = (v: number) => (v === 0 ? 0 : Math.max(1, Math.min(4, Math.ceil((Math.log1p(v) / Math.log1p(max)) * 4))));
  const shades = ["bg-white/[0.04]", "bg-yellow-300/15", "bg-yellow-300/25", "bg-yellow-300/40", "bg-yellow-300/60"];

  // Label a column with its month when it holds that month's first week.
  let lastMonth = "";
  const months = weeks.map((w) => {
    const d = w.find((x) => x && Number(x.date.slice(8)) <= 7);
    const m = d ? new Date(d.date + "T00:00:00Z").toLocaleString("en-US", { month: "short", timeZone: "UTC" }) : "";
    if (!m || m === lastMonth) return "";
    lastMonth = m;
    return m;
  });

  const options: { value: Metric; label: string }[] = [
    { value: "replies", label: "Replies" },
    { value: "positive", label: "Positive" },
  ];
  if (tracked) options.push({ value: "outcome", label: goal === "call" ? "Calls" : "Meetings" });

  return (
    <section>
      <div className="flex items-center justify-between gap-3">
        <SectionTitle>Activity · last 6 months</SectionTitle>
        <Segmented value={shown} options={options} onChange={setMetric} layoutId="metric-pill" />
      </div>
      <div className="glass mt-3 overflow-x-auto rounded-xl px-3 py-4 sm:px-4">
        <div className="mx-auto flex w-max gap-[2px] sm:gap-[3px]" role="img" aria-label={`Daily ${label}, last 6 months`}>
          {weeks.map((w, wi) => (
            <div key={wi} className="flex flex-col gap-[2px] sm:gap-[3px]">
              {Array.from({ length: 7 }, (_, di) => {
                const d = w[di];
                if (!d) return <span key={di} className="size-[9px] sm:size-[18px]" />;
                const v = d[key] as number;
                return (
                  <Tooltip key={di}>
                    <TooltipTrigger asChild>
                      <motion.span
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + wi * 0.015, duration: 0.3 }}
                        className={cn("block size-[9px] rounded-[3px] transition-colors duration-300 sm:size-[18px] sm:rounded-[4px]", shades[level(v)])}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      {int(v)} {label} · {new Date(d.date + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
              <span className="relative mt-1 h-3">
                <span className="absolute left-0 top-0 whitespace-nowrap text-[10px] leading-3 text-muted-foreground">{months[wi]}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function EditSetup({
  open,
  onOpenChange,
  setup,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setup: Setup;
  onSave: (s: Setup) => void;
}) {
  const [draft, setDraft] = useState(setup);
  useEffect(() => {
    if (open) setDraft(setup);
  }, [open, setup]);

  const set = <K extends keyof Setup>(key: K, value: Setup[K]) => setDraft((d) => ({ ...d, [key]: value }));
  const valid = draft.icp.trim().length >= 10 && destinationValid(draft);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit your setup</DialogTitle>
          <DialogDescription>
            Changes go to your operator, who applies them to your campaign. To change your daily volume, use Plan &amp; billing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label>Goal</Label>
          <GoalPicker value={draft.goal} onChange={(g) => set("goal", g)} />
        </div>
        <GoalDetails setup={draft} set={set} />

        <div className="space-y-1.5">
          <Label htmlFor="edit-icp">Ideal customer</Label>
          <Textarea id="edit-icp" value={draft.icp} onChange={(e) => set("icp", e.target.value)} />
        </div>

        <DialogFooter>
          <button
            onClick={() => onOpenChange(false)}
            className="h-8 rounded-md px-3 text-[12px] text-white/70 transition-colors hover:bg-white/[0.05] hover:text-white cursor-pointer"
          >
            Cancel
          </button>
          <button
            disabled={!valid}
            onClick={() => {
              onSave(draft);
              onOpenChange(false);
            }}
            className="h-8 rounded-md bg-white px-4 text-[12px] font-medium text-zinc-950 transition-all hover:bg-white/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-white/15 disabled:text-white/40 cursor-pointer"
          >
            Save changes
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function OperatorThread({ operatorName, note }: { operatorName: string; note: string | null }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stamp = (iso: string) => new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

  useEffect(() => {
    if (live) {
      // The real thread, including your operator's replies.
      authedFetch("/api/messages")
        .then((r) => (r.ok ? r.json() : { messages: [] }))
        .then((d: { messages: { sender: string; body: string; created_at: string }[] }) =>
          setMessages(d.messages.map((m) => ({ from: m.sender === "operator" ? "operator" : "you", text: m.body, when: stamp(m.created_at) })))
        )
        .catch(() => {});
      return;
    }
    try {
      const raw = localStorage.getItem(MESSAGES_KEY);
      if (raw) setMessages(JSON.parse(raw));
    } catch {
      // storage unavailable
    }
  }, []);

  const greeting = note || "Hi! I'm your Praz operator. Message me here any time with questions or changes, and I'll reply here and by email.";
  const thread: Message[] = [{ from: "operator", text: greeting, when: live ? (note ? "Latest update" : "Welcome") : "This week" }, ...messages];

  const send = async () => {
    const body = text.trim();
    if (!body || sending) return;
    setError(null);
    if (live) {
      setSending(true);
      try {
        const res = await authedFetch("/api/messages", { method: "POST", body: JSON.stringify({ body }) });
        if (!res.ok) throw new Error();
        const { message } = await res.json();
        setMessages((m) => [...m, { from: "you", text: message.body, when: stamp(message.created_at) }]);
        setText("");
      } catch {
        setError(`Couldn't send. Please email ${legal.supportEmail} instead.`);
      }
      setSending(false);
      return;
    }
    const next = [...messages, { from: "you" as const, text: body, when: stamp(new Date().toISOString()) }];
    setMessages(next);
    setText("");
    try {
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(next));
    } catch {
      // storage unavailable
    }
  };

  return (
    <section>
      <SectionTitle aside={live ? "replies show here and in your email" : "usually replies within a few hours"}>
        Message {operatorName}
      </SectionTitle>
      <div className="glass mt-3 rounded-xl p-4">
        <ul className="space-y-2">
          <AnimatePresence initial={false}>
            {thread.map((m, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease }}
                className={cn("flex", m.from === "you" ? "justify-end" : "justify-start")}
              >
                <div className={cn("max-w-[85%] rounded-lg px-3 py-2", m.from === "you" ? "bg-yellow-300/[0.12] text-white" : "glass-inset text-white/85")}>
                  <p className="text-[12px] leading-relaxed">{m.text}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {m.from === "you" ? "You" : live ? operatorName.replace(/^your operator$/, "Your operator") : operator.name} · {m.when}
                  </p>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        {error && <p className="mt-3 rounded-md bg-red-400/10 px-3 py-2 text-[12px] text-red-200">{error}</p>}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="mt-3 flex items-end gap-2"
        >
          <label htmlFor="operator-message" className="sr-only">
            Message your operator
          </label>
          <Textarea
            id="operator-message"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Ask a question or request a change…"
            className="min-h-9 resize-none py-1.5"
            rows={1}
          />
          <button
            type="submit"
            disabled={!text.trim() || sending}
            aria-label="Send message"
            className="flex size-9 shrink-0 items-center justify-center rounded-md bg-white text-zinc-950 transition-all hover:bg-white/90 active:scale-95 disabled:cursor-not-allowed disabled:bg-white/15 disabled:text-white/40 cursor-pointer"
          >
            {sending ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
          </button>
        </form>
      </div>
    </section>
  );
}

function SectionTitle({ children, aside }: { children: React.ReactNode; aside?: string }) {
  return (
    <h2 className="flex min-w-0 items-baseline gap-2 text-[13px] font-medium">
      <span className="shrink-0">{children}</span>
      {aside && <span className="truncate text-[11px] font-normal text-muted-foreground">{aside}</span>}
    </h2>
  );
}

function Row({
  label,
  sub,
  value,
  icon: Icon,
}: {
  label: string;
  sub?: string;
  value: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex min-h-[34px] items-center justify-between gap-3 text-[13px]">
      <dt className="flex min-w-0 items-center gap-2">
        {Icon && (
          <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-white/[0.06]">
            <Icon className="size-3 text-white/80" />
          </span>
        )}
        <span className="min-w-0">
          <span className={cn("block truncate tabular-nums", Icon ? "text-white/90" : "text-muted-foreground")}>{label}</span>
          {sub && <span className="block truncate text-[10px] text-muted-foreground">{sub}</span>}
        </span>
      </dt>
      <dd className="min-w-0 truncate text-right text-[12px] tabular-nums text-white">{value}</dd>
    </div>
  );
}

function CallStatus({ status }: { status: Call["status"] }) {
  return (
    <span
      className={cn(
        "rounded px-1.5 py-px text-[10px] font-medium",
        status === "Answered" && "bg-yellow-300/15 text-yellow-100",
        status === "Voicemail" && "bg-white/[0.06] text-white/70",
        status === "Missed" && "bg-red-400/10 text-red-300"
      )}
    >
      {status}
    </span>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-inset mt-2 flex items-center justify-between rounded-lg px-3 py-2 text-[12px]">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  );
}
