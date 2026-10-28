"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUpRight,
  CalendarDays,
  Info,
  LayoutDashboard,
  Lock,
  MessageCircle,
  Tag,
} from "lucide-react";
import { LogoMark } from "@/components/logo";
import { AnimatedNumber } from "@/components/animated-number";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { defaultVolumeIndex, formatVolume, pricing, site, volumes } from "@/lib/site";
import { authConfigured, currentEmail } from "@/lib/auth";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;
const fade = (delay: number) => ({
  initial: { opacity: 0, y: 8, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 0.7, delay, ease },
});

const ASSUME = { reply: 0.01, positive: 0.05, meeting: 0.4, days: 22 };

const facts = [
  { k: "$10k+", v: "Minimum LTV" },
  { k: "1k–5k", v: "Emails per day" },
  { k: "< 3 days", v: "To launch" },
  { k: "100%", v: "Done for you" },
  { k: "$0", v: "Setup fees" },
];

const int = (n: number) => Math.round(n).toLocaleString("en-US");
const usd = (n: number) => "$" + int(n);
const dec = (n: number) => (Math.round(n * 10) / 10).toLocaleString("en-US");
const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));
const LTV = { min: 10000, max: 500000 };
const CLOSE = { min: 5, max: 50 };

export function Overview() {
  return (
    <section className="relative flex min-h-svh flex-col">
      <TopBar />
      <div className="mx-auto flex w-full max-w-[680px] flex-1 flex-col px-4 pb-12 pt-12 md:pt-16">
        <Identity />
        <Facts />
        <Calculator />
      </div>
      <a
        href={site.bookUrl}
        aria-label="Talk to us"
        className="glass fixed bottom-5 right-5 z-40 flex size-11 items-center justify-center rounded-2xl text-white/80 transition-all duration-300 hover:scale-105 hover:text-white"
      >
        <MessageCircle className="size-4.5" />
      </a>
    </section>
  );
}

function TopBar() {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    if (authConfigured) currentEmail().then((e) => setSignedIn(!!e));
  }, []);
  const items = [
    { href: site.onboardingUrl, label: "Start now", icon: ArrowUpRight, mobile: false },
    { href: "#pricing", label: "Pricing", icon: Tag, mobile: false },
    signedIn
      ? { href: site.dashboardUrl, label: "Dashboard", icon: LayoutDashboard, mobile: true }
      : { href: site.loginUrl, label: "Log in", icon: Lock, mobile: true },
  ];
  return (
    <motion.header {...fade(0)} className="flex items-center justify-between px-4 py-3 md:px-5">
      <span className="text-[13px] font-medium text-white/90">Praz</span>
      <nav className="flex items-center gap-0.5">
        <a
          href={site.bookUrl}
          className="flex items-center gap-1.5 rounded-md bg-white/[0.07] px-2.5 py-1 text-[12px] font-medium text-white transition-colors hover:bg-white/[0.12]"
        >
          <CalendarDays className="size-3.5" /> Book a Call
        </a>
        {items.map(({ href, label, icon: Icon, mobile }) => (
          <a
            key={label}
            href={href}
            className={cn(
              "items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] text-white/70 transition-colors hover:bg-white/[0.05] hover:text-white",
              mobile ? "flex" : "hidden sm:flex"
            )}
          >
            <Icon className="size-3.5" /> {label}
          </a>
        ))}
      </nav>
    </motion.header>
  );
}

const ROTATE = [1000, 2000, 3000, 4000, 5000];

function Identity() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % ROTATE.length), 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease }}
        className="flex items-center justify-center"
      >
        <LogoMark className="size-14 text-white" />
      </motion.div>

      <motion.h1
        {...fade(0.1)}
        className="mt-5 flex flex-wrap items-center justify-center gap-x-[0.3em] text-[22px] font-medium tracking-[-0.02em] md:text-[24px]"
      >
        <span>We send</span>
        <span className="relative inline-flex h-[1.25em] w-[3.1em] items-center justify-center overflow-hidden rounded-[0.25em] bg-yellow-300/20 px-[0.2em] tabular-nums">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={ROTATE[i]}
              initial={{ y: "100%", opacity: 0, filter: "blur(4px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              exit={{ y: "-100%", opacity: 0, filter: "blur(4px)" }}
              transition={{ duration: 0.5, ease }}
              className="inline-block"
            >
              {ROTATE[i].toLocaleString("en-US")}
            </motion.span>
          </AnimatePresence>
        </span>
        <span>emails per day for you</span>
      </motion.h1>

      <motion.p {...fade(0.18)} className="mt-1.5 flex items-center gap-2 text-[12px] text-muted-foreground">
        <span>Done-for-you outbound</span>
        <span className="text-white/20">·</span>
        <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-white/70">High-ticket only</span>
      </motion.p>
    </div>
  );
}

function Facts() {
  return (
    <motion.dl
      {...fade(0.26)}
      className="glass mt-8 grid grid-cols-3 rounded-xl py-1 sm:grid-cols-5"
    >
      {facts.map((f, i) => (
        <div
          key={f.v}
          className={cn(
            "flex flex-col items-center px-2 py-2.5 text-center",
            i > 0 && "sm:border-l sm:border-white/[0.06]",
            i > 2 && "max-sm:hidden"
          )}
        >
          <dt className="text-[13px] font-medium tabular-nums">{f.k}</dt>
          <dd className="mt-0.5 text-[11px] text-muted-foreground">{f.v}</dd>
        </div>
      ))}
    </motion.dl>
  );
}

function Calculator() {
  const [volIdx, setVolIdx] = useState(defaultVolumeIndex);
  const [ltv, setLtv] = useState(50000);
  const [close, setClose] = useState(20);

  const perDay = volumes[volIdx];
  const cost = pricing[perDay];
  const replies = perDay * ASSUME.days * ASSUME.reply;
  const positive = replies * ASSUME.positive;
  const meetings = positive * ASSUME.meeting;
  // Whole clients only, so revenue matches the deals shown.
  const deals = Math.round(meetings * (close / 100));
  const revenue = deals * ltv;
  const roi = ((revenue - cost) / cost) * 100;

  return (
    <motion.div {...fade(0.34)} id="roi" className="mt-10">
      <h2 className="text-center text-[13px] font-medium">ROI calculator</h2>

      <div className="glass mt-3 grid overflow-hidden rounded-xl sm:grid-cols-2">
        {/* inputs */}
        <div className="space-y-5 p-5">
          <p className="text-[12px] font-medium text-white/90">Your numbers</p>

          <Field
            label="Emails per day"
            hint="Daily sending volume across your managed inboxes."
            value={<span className="tabular-nums">{perDay.toLocaleString("en-US")}/day</span>}
          >
            <Slider value={[volIdx]} min={0} max={volumes.length - 1} step={1} onValueChange={([v]) => setVolIdx(v)} />
            <div className="mt-1.5 flex justify-between">
              {volumes.map((v, i) => (
                <button
                  key={v}
                  onClick={() => setVolIdx(i)}
                  className={cn(
                    "w-6 text-center text-[10px] tabular-nums transition-colors cursor-pointer",
                    i === volIdx ? "text-yellow-200" : "text-muted-foreground hover:text-white"
                  )}
                >
                  {formatVolume(v)}
                </button>
              ))}
            </div>
          </Field>

          <Field
            label="Average client LTV"
            hint="Lifetime value of one new client. Praz is built for $10k+."
            value={
              <span className="flex items-center gap-1">
                <span className="text-muted-foreground">$</span>
                <Input
                  id="ltv"
                  type="number"
                  value={ltv}
                  onChange={(e) => setLtv(Number(e.target.value) || 0)}
                  onBlur={() => setLtv((v) => clamp(v, LTV.min, LTV.max))}
                  className="h-6 w-20 px-2 text-right text-[12px]"
                />
              </span>
            }
          >
            <Slider
              value={[clamp(ltv, LTV.min, LTV.max)]}
              min={LTV.min}
              max={LTV.max}
              step={5000}
              onValueChange={([v]) => setLtv(v)}
            />
            <Range a="$10k" b="$500k" />
          </Field>

          <Field
            label="Close rate from meetings"
            hint="Share of booked meetings that become paying clients."
            value={
              <span className="flex items-center gap-1">
                <Input
                  id="close"
                  type="number"
                  value={close}
                  onChange={(e) => setClose(Number(e.target.value) || 0)}
                  onBlur={() => setClose((v) => clamp(v, CLOSE.min, CLOSE.max))}
                  className="h-6 w-11 px-2 text-right text-[12px]"
                />
                <span className="text-muted-foreground">%</span>
              </span>
            }
          >
            <Slider
              value={[clamp(close, CLOSE.min, CLOSE.max)]}
              min={CLOSE.min}
              max={CLOSE.max}
              step={1}
              onValueChange={([v]) => setClose(v)}
            />
            <Range a="5%" b="50%" />
          </Field>

          <div className="glass-inset rounded-lg px-3 py-2">
            <p className="text-[10px] leading-relaxed text-muted-foreground">
              <span className="font-medium text-white">Conservative:</span> 1% reply · 5% positive · 40% meet · 22 days/mo
            </p>
          </div>
        </div>

        {/* results */}
        <div className="flex flex-col border-t border-white/[0.06] bg-white/[0.015] p-5 sm:border-t-0 sm:border-l">
          <p className="text-[12px] font-medium text-white/90">Projected monthly results</p>

          <div className="mt-3 grid grid-cols-2 gap-1.5">
            <Stat label="Total replies" value={replies} />
            <Stat label="Positive replies" value={positive} accent />
            <Stat label="Meetings booked" value={meetings} decimals />
            <Stat label="Deals closed" value={deals} />
          </div>

          <Separator className="my-3" />

          <div className="flex items-end justify-between">
            <span className="text-[11px] text-muted-foreground">Projected revenue</span>
            <AnimatedNumber value={revenue} format={usd} className="text-2xl font-semibold tracking-tight tabular-nums" />
          </div>
          <div className="mt-3 space-y-1.5 text-[12px]">
            <Row label="Praz (fully managed)" value={<AnimatedNumber value={cost} format={(n) => usd(n) + "/mo"} />} />
            <Row
              label="ROI"
              value={
                <span className={cn("rounded px-1.5 py-0.5 font-medium", roi >= 0 ? "bg-yellow-300/20 text-white" : "text-red-300")}>
                  <AnimatedNumber value={roi} format={(n) => int(n) + "%"} />
                </span>
              }
            />
          </div>

          <div className="mt-auto grid grid-cols-2 gap-1.5 pt-3">
            <a
              href={site.bookUrl}
              className="group flex h-8 items-center justify-center gap-1.5 rounded-md bg-white text-[12px] font-medium text-zinc-950 transition-all hover:bg-white/90 active:scale-[0.98]"
            >
              Book a Call
              <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:-translate-y-px group-hover:translate-x-px" />
            </a>
            <a
              href={site.onboardingUrl}
              className="flex h-8 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-[12px] font-medium text-yellow-100 transition-colors hover:border-yellow-300/25 hover:bg-white/[0.07]"
            >
              Or start now
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Field({
  label,
  hint,
  value,
  children,
}: {
  label: string;
  hint: string;
  value: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3 text-[12px]">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          {label}
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="size-3 cursor-help text-white/30 transition-colors hover:text-white/70" />
            </TooltipTrigger>
            <TooltipContent>{hint}</TooltipContent>
          </Tooltip>
        </span>
        <span className="font-medium">{value}</span>
      </div>
      {children}
    </div>
  );
}

function Range({ a, b }: { a: string; b: string }) {
  return (
    <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground">
      <span>{a}</span>
      <span>{b}</span>
    </div>
  );
}

function Stat({ label, value, accent, decimals }: { label: string; value: number; accent?: boolean; decimals?: boolean }) {
  return (
    <div className="glass-inset rounded-lg px-3 py-2">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <AnimatedNumber
        value={value}
        format={decimals ? dec : int}
        className={cn("mt-0.5 block text-base font-semibold tabular-nums tracking-tight", accent && "text-yellow-200")}
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
