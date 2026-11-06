"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { CalendarDays, MessageCircle, RotateCcw } from "lucide-react";
import { LogoMark } from "@/components/logo";
import { AnimatedNumber } from "@/components/animated-number";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Field, TopBar, fade } from "@/components/sections/overview";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const int = (n: number) => Math.round(n).toLocaleString("en-US");
const usd = (n: number) => "$" + int(n);
const dec = (n: number) => (Math.round(n * 10) / 10).toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const pct = (n: number) => `${n}%`;

type Key = "calls" | "unanswered" | "opportunity" | "booked" | "show" | "close" | "jobValue" | "margin";

const DEFAULTS: Record<Key, number> = {
  calls: 200,
  unanswered: 27,
  opportunity: 38,
  booked: 50,
  show: 70,
  close: 30,
  jobValue: 15000,
  margin: 35,
};

const INPUTS: { key: Key; label: string; hint: string; min: number; max: number; step: number; format: (n: number) => string }[] = [
  { key: "calls", label: "Inbound calls / month", hint: "Every call your business gets in a month.", min: 10, max: 2000, step: 10, format: int },
  { key: "unanswered", label: "Calls unanswered", hint: "Share of calls that ring out, hit voicemail or come in after hours.", min: 0, max: 80, step: 1, format: pct },
  { key: "opportunity", label: "Revenue opportunities", hint: "Share of missed callers who wanted to buy, not spam or existing customers.", min: 0, max: 100, step: 1, format: pct },
  { key: "booked", label: "Appointments booked", hint: "Share of those opportunities that turn into a booked appointment.", min: 0, max: 100, step: 1, format: pct },
  { key: "show", label: "Appointment show rate", hint: "Share of booked appointments that actually happen.", min: 0, max: 100, step: 1, format: pct },
  { key: "close", label: "Close rate", hint: "Share of attended appointments that become paying jobs.", min: 0, max: 100, step: 1, format: pct },
  { key: "jobValue", label: "Average job value", hint: "Revenue from one closed job.", min: 500, max: 100000, step: 500, format: usd },
  { key: "margin", label: "Gross margin", hint: "What you keep from a job after materials and labor.", min: 5, max: 90, step: 1, format: pct },
];

// Our fee: 30% of the projected extra gross profit, rounded to the nearest $250.
const FEE_SHARE = 0.3;
const FEE_ROUND = 250;

export function Recovery() {
  return (
    <section className="relative flex min-h-svh flex-col">
      <TopBar home />
      <div className="mx-auto flex w-full max-w-[760px] flex-1 flex-col px-4 pb-12 pt-12 md:pt-16">
        <Header />
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

function Header() {
  return (
    <div className="flex flex-col items-center text-center">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
        <LogoMark className="size-14 text-white" />
      </motion.div>
      <motion.h1 {...fade(0.1)} className="mt-5 text-[22px] font-medium tracking-[-0.02em] md:text-[24px]">
        Every <span className="rounded-[0.25em] bg-yellow-300/20 px-[0.2em]">missed call</span> is a lost job
      </motion.h1>
      <motion.p {...fade(0.18)} className="mt-2 max-w-md text-[13px] leading-relaxed text-muted-foreground">
        See what answering them is worth. You only pay a share of the profit we recover.
      </motion.p>
    </div>
  );
}

function Calculator() {
  const [v, setV] = useState(DEFAULTS);
  const changed = (Object.keys(DEFAULTS) as Key[]).some((k) => v[k] !== DEFAULTS[k]);

  const unanswered = v.calls * (v.unanswered / 100);
  const opportunities = unanswered * (v.opportunity / 100);
  const booked = opportunities * (v.booked / 100);
  const attended = booked * (v.show / 100);
  const closed = attended * (v.close / 100);
  const revenue = closed * v.jobValue;
  const profit = revenue * (v.margin / 100);
  const fee = Math.max(0, Math.round((profit * FEE_SHARE) / FEE_ROUND) * FEE_ROUND);
  const net = profit - fee;

  return (
    <motion.div {...fade(0.26)} id="calculator" className="mt-10">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-[13px] font-medium">Revenue recovery calculator</h2>
        <button
          onClick={() => setV(DEFAULTS)}
          disabled={!changed}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-white/70 transition-colors hover:bg-white/[0.05] hover:text-white disabled:pointer-events-none disabled:opacity-40 cursor-pointer"
        >
          <RotateCcw className="size-3" /> Reset
        </button>
      </div>

      <div className="glass mt-3 grid overflow-hidden rounded-xl md:grid-cols-[1.1fr_1fr]">
        {/* inputs */}
        <div className="space-y-4 p-5">
          <p className="text-[12px] font-medium text-white/90">Your numbers</p>
          {INPUTS.map((f) => (
            <Field key={f.key} label={f.label} hint={f.hint} value={<span className="tabular-nums">{f.format(v[f.key])}</span>}>
              <Slider
                aria-label={f.label}
                value={[v[f.key]]}
                min={f.min}
                max={f.max}
                step={f.step}
                onValueChange={([n]) => setV((s) => ({ ...s, [f.key]: n }))}
              />
            </Field>
          ))}
        </div>

        {/* results */}
        <div className="flex flex-col border-t border-white/[0.06] bg-white/[0.015] p-5 md:border-l md:border-t-0">
          <p className="text-[12px] font-medium text-white/90">Every month</p>
          <dl className="mt-3 space-y-2.5 text-[12px]">
            <Row label="Unanswered calls" value={unanswered} />
            <Row label="Revenue opportunities" value={opportunities} />
            <Row label="Booked appointments" value={booked} />
            <Row label="Attended appointments" value={attended} />
            <Row label="Additional closed deals" value={closed} decimals />
          </dl>

          <Separator className="my-4 bg-white/[0.06]" />

          <dl className="space-y-2 text-[13px]">
            <div className="flex items-center justify-between">
              <dt className="text-white/85">Additional revenue</dt>
              <AnimatedNumber value={revenue} format={usd} className="font-semibold tabular-nums" />
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-white/85">Additional gross profit</dt>
              <AnimatedNumber value={profit} format={usd} className="font-semibold tabular-nums text-yellow-200" />
            </div>
          </dl>

          <div className="glass-inset mt-4 rounded-lg px-3.5 py-3">
            <div className="flex items-baseline justify-between">
              <span className="text-[13px] font-medium">Your price</span>
              <span className="text-[20px] font-semibold tracking-tight tabular-nums">
                <AnimatedNumber value={fee} format={usd} />
                <span className="ml-0.5 text-[11px] font-normal text-muted-foreground">/mo</span>
              </span>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              30% of the projected extra gross profit, rounded to the nearest $250.
            </p>
            <div className="mt-2.5 flex items-center justify-between border-t border-white/[0.06] pt-2.5 text-[12px]">
              <span className="text-muted-foreground">You keep</span>
              <AnimatedNumber value={net} format={(n) => usd(n) + "/mo"} className={cn("font-medium tabular-nums", net > 0 && "text-yellow-100")} />
            </div>
          </div>

          <a
            href={site.bookUrl}
            className="mt-4 flex h-9 items-center justify-center gap-1.5 rounded-md bg-white text-[12px] font-medium text-zinc-950 transition-colors hover:bg-white/90"
          >
            <CalendarDays className="size-3.5" /> Book a call
          </a>
          <p className="mt-auto pt-4 text-[10px] leading-relaxed text-muted-foreground">
            Illustrative estimates, not guaranteed results. Assumes missed opportunities can be recovered and are incremental.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function Row({ label, value, decimals }: { label: string; value: number; decimals?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <AnimatedNumber value={value} format={decimals ? dec : int} className="tabular-nums" />
    </div>
  );
}
