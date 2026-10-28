"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  CalendarCheck,
  CalendarDays,
  Globe,
  Inbox,
  LogOut,
  MessageSquareText,
  Phone,
  PhoneIncoming,
  Settings,
  Target,
  UserRound,
} from "lucide-react";
import { LogoMark } from "@/components/logo";
import { AnimatedNumber } from "@/components/animated-number";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  calls,
  client,
  days,
  meetings,
  positiveReplies,
  totals,
  type Call,
  type Day,
  type Goal,
} from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;
const fade = (delay: number) => ({
  initial: { opacity: 0, y: 8, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 0.7, delay, ease },
});

const int = (n: number) => Math.round(n).toLocaleString("en-US");
const usd = (n: number) => "$" + int(n);
const pct = (n: number) => (Math.round(n * 10) / 10).toFixed(1) + "%";

const RANGES = [7, 30, 90, 180] as const;
type Range = (typeof RANGES)[number];

export function Dashboard() {
  const [goal, setGoal] = useState<Goal>(client.goal);
  const [range, setRange] = useState<Range>(30);

  const t = useMemo(() => totals(days.slice(-range)), [range]);
  const cost = client.monthlyPrice * (range / 30);
  const isCall = goal === "call";

  const stats = [
    { k: t.sent, v: "Emails sent", f: int },
    { k: t.replies, v: "Total replies", f: int },
    { k: t.positive, v: "Positive replies", f: int, accent: true },
    isCall ? { k: t.calls, v: "Tracked calls", f: int } : { k: t.meetings, v: "Meetings booked", f: int },
    { k: t.positive ? cost / t.positive : 0, v: "Cost per positive", f: usd },
  ];

  return (
    <div className="relative flex min-h-svh flex-col">
      <TopBar goal={goal} setGoal={setGoal} />

      <div className="mx-auto flex w-full max-w-[680px] flex-1 flex-col px-4 pb-16 pt-12 md:pt-16">
        {/* identity */}
        <div className="flex flex-col items-center text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease }}>
            <LogoMark className="size-14 text-white" />
          </motion.div>
          <motion.h1 {...fade(0.1)} className="mt-5 text-[22px] font-medium tracking-[-0.02em] md:text-[24px]">
            {client.name}
          </motion.h1>
          <motion.p {...fade(0.18)} className="mt-1.5 flex flex-wrap items-center justify-center gap-2 text-[12px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-yellow-300 opacity-60" />
                <span className="relative inline-flex size-1.5 rounded-full bg-yellow-300" />
              </span>
              Campaign live · {int(client.dailyVolume)}/day
            </span>
            <span className="text-white/20">·</span>
            <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-white/70">
              Goal: {isCall ? "calls to your phone" : "booked calls"}
            </span>
          </motion.p>
        </div>

        {/* range + stats */}
        <motion.div {...fade(0.26)} className="mt-8">
          <div className="mb-2.5 flex justify-center">
            <Segmented
              value={range}
              options={RANGES.map((r) => ({ value: r, label: `${r}d` }))}
              onChange={setRange}
              layoutId="range-pill"
            />
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
          <Activity goal={goal} />
        </motion.div>

        <motion.div {...fade(0.42)} className="mt-10 grid gap-8 sm:grid-cols-2">
          <section>
            <SectionTitle>Latest positive replies</SectionTitle>
            <ul className="mt-2 space-y-1.5">
              {positiveReplies.map((r) => (
                <li key={r.name} className="glass-inset rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2 text-[12px]">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-white/[0.06] text-[9px] font-medium">
                      {r.name[0]}
                    </span>
                    <span className="truncate font-medium">{r.name}</span>
                    <span className="truncate text-[11px] text-muted-foreground">
                      {r.title} · {r.company}
                    </span>
                    <span className="ml-auto shrink-0 text-[10px] text-muted-foreground">{r.when}</span>
                  </div>
                  <p className="mt-1 pl-7 text-[12px] text-white/70">“{r.message}”</p>
                </li>
              ))}
            </ul>
          </section>

          <section>
            {isCall ? (
              <>
                <SectionTitle aside="via CallRail">Tracked calls</SectionTitle>
                <dl className="mt-2">
                  {calls.map((c) => (
                    <Row
                      key={c.name}
                      icon={PhoneIncoming}
                      label={c.name}
                      sub={`${c.company} · ${c.when}`}
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
            ) : (
              <>
                <SectionTitle aside={client.calendar}>Upcoming meetings</SectionTitle>
                <dl className="mt-2">
                  {meetings.map((m) => (
                    <Row key={m.name} icon={CalendarCheck} label={m.name} sub={m.company} value={<span className="text-muted-foreground">{m.when}</span>} />
                  ))}
                </dl>
                <Summary label="Booked this period" value={int(t.meetings)} />
              </>
            )}
          </section>
        </motion.div>

        <motion.div {...fade(0.5)} className="mt-10 grid gap-8 sm:grid-cols-2">
          <section>
            <SectionTitle>Campaign health</SectionTitle>
            <dl className="mt-2">
              <Row label="Reply rate" value={pct(t.sent ? (t.replies / t.sent) * 100 : 0)} />
              <Row label="Positive rate" sub="of replies" value={pct(t.replies ? (t.positive / t.replies) * 100 : 0)} />
              {isCall ? (
                <Row label="Positive replies that called" value={pct(t.positive ? (t.calls / t.positive) * 100 : 0)} />
              ) : (
                <Row label="Positive replies that booked" value={pct(t.positive ? (t.meetings / t.positive) * 100 : 0)} />
              )}
              <Row label="Active inboxes" value={int(client.inboxes)} />
              <Row label="Sending domains" value={int(client.domains)} />
            </dl>
          </section>

          <section>
            <SectionTitle>Your setup</SectionTitle>
            <dl className="mt-2">
              <Row icon={Target} label="Goal" value={isCall ? "Calls to your phone" : "Booked calls"} />
              {isCall ? (
                <Row icon={Phone} label="Forwarding number" value={client.phone} />
              ) : (
                <Row icon={CalendarDays} label="Booking link" value={client.calendar} />
              )}
              <Row icon={UserRound} label="Your operator" value={client.operator} />
              <Row icon={Inbox} label="Daily volume" value={`${int(client.dailyVolume)}/day`} />
            </dl>
            <div className="glass-inset mt-2 rounded-lg px-3 py-2">
              <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Globe className="size-3" /> Ideal customer
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-white/80">{client.icp}</p>
            </div>
          </section>
        </motion.div>

        <motion.div {...fade(0.58)} className="glass mt-10 rounded-xl px-4 py-3.5">
          <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <MessageSquareText className="size-3" /> Note from {client.operator} · this week
          </p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-white/85">{client.note}</p>
        </motion.div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function TopBar({ goal, setGoal }: { goal: Goal; setGoal: (g: Goal) => void }) {
  return (
    <motion.header {...fade(0)} className="flex items-center justify-between gap-3 px-4 py-3 md:px-5">
      <span className="text-[13px] font-medium text-white/90">Dashboard</span>
      <nav className="flex items-center gap-1">
        <span className="mr-1 hidden text-[11px] text-muted-foreground sm:inline">Preview goal</span>
        <Segmented
          value={goal}
          options={[
            { value: "call", label: "Calls" },
            { value: "book", label: "Meetings" },
          ]}
          onChange={setGoal}
          layoutId="goal-pill"
        />
        <a
          href="#settings"
          className="hidden items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] text-white/70 transition-colors hover:bg-white/[0.05] hover:text-white sm:flex"
        >
          <Settings className="size-3.5" /> Settings
        </a>
        <a
          href="#logout"
          className="hidden items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] text-white/70 transition-colors hover:bg-white/[0.05] hover:text-white sm:flex"
        >
          <LogOut className="size-3.5" /> Log out
        </a>
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
            <motion.span
              layoutId={layoutId}
              className="absolute inset-0 rounded-md bg-white/[0.07]"
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
            />
          )}
          <span className="relative">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

type Metric = "replies" | "positive" | "outcome";

function Activity({ goal }: { goal: Goal }) {
  const [metric, setMetric] = useState<Metric>("positive");
  const key: keyof Day = metric === "outcome" ? (goal === "call" ? "calls" : "meetings") : metric;
  const label = metric === "outcome" ? (goal === "call" ? "calls" : "meetings") : metric === "positive" ? "positive replies" : "replies";

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

  return (
    <section>
      <div className="flex items-center justify-between gap-3">
        <SectionTitle>Activity · last 6 months</SectionTitle>
        <Segmented
          value={metric}
          options={[
            { value: "replies", label: "Replies" },
            { value: "positive", label: "Positive" },
            { value: "outcome", label: goal === "call" ? "Calls" : "Meetings" },
          ]}
          onChange={setMetric}
          layoutId="metric-pill"
        />
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
                      {int(v)} {label} ·{" "}
                      {new Date(d.date + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}
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

function SectionTitle({ children, aside }: { children: React.ReactNode; aside?: string }) {
  return (
    <h2 className="flex items-baseline gap-2 text-[13px] font-medium">
      {children}
      {aside && <span className="text-[11px] font-normal text-muted-foreground">{aside}</span>}
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
          <span className={cn("block truncate", Icon ? "text-white/90" : "text-muted-foreground")}>{label}</span>
          {sub && <span className="block truncate text-[10px] text-muted-foreground">{sub}</span>}
        </span>
      </dt>
      <dd className="shrink-0 text-right text-[12px] tabular-nums text-white">{value}</dd>
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
