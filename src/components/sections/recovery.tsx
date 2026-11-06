"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, CalendarDays, MessageCircle, RotateCcw, SlidersHorizontal } from "lucide-react";
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
  booked: 45,
  show: 85,
  close: 35,
  jobValue: 15000,
  margin: 35,
};

type Step = {
  key: Key;
  label: string;
  question: string;
  hint: string;
  min: number;
  max: number;
  step: number;
  format: (n: number) => string;
  unit: "count" | "pct" | "usd";
  /** Benchmark steps explain an industry average instead of asking; it's still adjustable on the results screen. */
  info?: (r: ReturnType<typeof compute>, v: Record<Key, number>) => { fact: string; yours: string };
  /** Small label above a benchmark step. */
  basis?: string;
};

const INPUTS: Step[] = [
  { key: "calls", label: "Inbound calls / month", question: "How many calls does your business get each month?", hint: "Every inbound call, answered or not.", min: 10, max: 2000, step: 10, format: int, unit: "count" },
  {
    key: "unanswered", label: "Calls unanswered", question: "Calls that go unanswered", hint: "Calls that ring out, hit voicemail or come in after hours.", min: 0, max: 80, step: 1, format: pct, unit: "pct",
    info: (r, v) => ({ fact: "of calls to the average service business go unanswered: busy lines, after-hours calls and voicemail.", yours: `That's about ${int(r.unanswered)} of your ${int(v.calls)} calls every month.` }),
  },
  {
    key: "opportunity", label: "Revenue opportunities", question: "Missed callers ready to buy", hint: "Leaving out spam, vendors and existing customers.", min: 0, max: 100, step: 1, format: pct, unit: "pct",
    info: (r) => ({ fact: "of missed callers are new buyers on average, not spam, vendors or existing customers.", yours: `That's about ${int(r.opportunities)} buyers a month who called and never reached you.` }),
  },
  {
    key: "booked", label: "Estimate booking rate", question: "Callers who book an estimate", hint: "Share of buyers who book an estimate when their call is answered.", min: 0, max: 100, step: 1, format: pct, unit: "pct",
    basis: "Invoca home-services benchmark",
    info: (r) => ({ fact: "of home-services phone leads book an estimate, based on Invoca's phone-lead conversion benchmark.", yours: `That's about ${int(r.booked)} extra estimates booked each month.` }),
  },
  {
    key: "show", label: "Estimate completion rate", question: "Booked estimates that get completed", hint: "Share of booked estimates that actually happen.", min: 0, max: 100, step: 1, format: pct, unit: "pct",
    basis: "Conservative estimate",
    info: (r) => ({ fact: "of booked estimates get completed. This is a conservative planning assumption, since reliable home-services data is limited.", yours: `That's about ${int(r.attended)} extra estimates completed each month.` }),
  },
  { key: "close", label: "Close rate", question: "How many completed estimates do you close?", hint: "Share of estimates that become paid jobs.", min: 0, max: 100, step: 1, format: pct, unit: "pct" },
  { key: "jobValue", label: "Average job value", question: "What's your average job worth?", hint: "Revenue from one closed job.", min: 500, max: 100000, step: 500, format: usd, unit: "usd" },
  { key: "margin", label: "Gross margin", question: "What's your gross margin on a job?", hint: "What you keep after materials and labor.", min: 5, max: 90, step: 1, format: pct, unit: "pct" },
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
      <motion.h1 {...fade(0.1)} className="mt-5 max-w-xl text-balance text-[22px] font-medium tracking-[-0.02em] md:text-[24px]">
        We turn your <span className="rounded-[0.25em] bg-yellow-300/20 px-[0.2em]">missed calls</span> into booked jobs and additional profit
      </motion.h1>
      <motion.p {...fade(0.18)} className="mt-2 max-w-md text-[13px] leading-relaxed text-muted-foreground">
        (and only take a % of the additional profit we bring)
      </motion.p>
    </div>
  );
}

function compute(v: Record<Key, number>) {
  const unanswered = v.calls * (v.unanswered / 100);
  const opportunities = unanswered * (v.opportunity / 100);
  const booked = opportunities * (v.booked / 100);
  const attended = booked * (v.show / 100);
  const closed = attended * (v.close / 100);
  const revenue = closed * v.jobValue;
  const profit = revenue * (v.margin / 100);
  const fee = Math.max(0, Math.round((profit * FEE_SHARE) / FEE_ROUND) * FEE_ROUND);
  return { unanswered, opportunities, booked, attended, closed, revenue, profit, fee, net: profit - fee };
}

const clamp = (n: number, f: Step) => Math.min(f.max, Math.max(f.min, n));
// Typed counts and dollar amounts may go past the slider's end; percentages stop at its max.
const clampTyped = (n: number, f: Step) => (f.unit === "pct" ? clamp(n, f) : Math.max(f.min, n));

function Calculator() {
  const [v, setV] = useState(DEFAULTS);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const done = step >= INPUTS.length;
  const go = (n: number) => {
    setDir(n > step ? 1 : -1);
    setStep(n);
  };
  const set = (k: Key, n: number) => setV((s) => ({ ...s, [k]: n }));

  return (
    <motion.div {...fade(0.26)} id="calculator" className="mx-auto mt-10 w-full max-w-[520px]">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-[13px] font-medium">{done ? "Your recovered revenue" : "Revenue recovery calculator"}</h2>
        <span className="text-[11px] tabular-nums text-muted-foreground">{done ? "Every month" : `${step + 1} of ${INPUTS.length}`}</span>
      </div>
      {/* progress */}
      <div className="mt-2 flex gap-1 px-1" aria-hidden>
        {INPUTS.map((f, i) => (
          <button
            key={f.key}
            tabIndex={-1}
            onClick={() => (i < step || done) && go(i)}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-300",
              i < step || done ? "bg-yellow-300/80 cursor-pointer" : i === step ? "bg-yellow-300/40" : "bg-white/10"
            )}
          />
        ))}
      </div>

      <div className="glass relative mt-3 overflow-hidden rounded-xl">
        <AnimatePresence mode="wait" initial={false} custom={dir}>
          <motion.div
            key={done ? "results" : INPUTS[step].key}
            custom={dir}
            initial={{ opacity: 0, x: 24 * dir, filter: "blur(4px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -24 * dir, filter: "blur(4px)" }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {done ? (
              <Results v={v} set={set} onRestart={() => { setV(DEFAULTS); go(0); }} onBack={() => go(INPUTS.length - 1)} />
            ) : (
              <Question f={INPUTS[step]} v={v} value={v[INPUTS[step].key]} onChange={(n) => set(INPUTS[step].key, n)} onNext={() => go(step + 1)} onBack={step > 0 ? () => go(step - 1) : undefined} last={step === INPUTS.length - 1} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function Question({ f, v, value, onChange, onNext, onBack, last }: { f: Step; v: Record<Key, number>; value: number; onChange: (n: number) => void; onNext: () => void; onBack?: () => void; last: boolean }) {
  const [text, setText] = useState(String(value));
  const ref = useRef<HTMLInputElement>(null);
  const next = useRef<HTMLButtonElement>(null);
  useEffect(() => setText(String(value)), [value]);
  useEffect(() => {
    // Focus without scrolling on touch screens, where the keyboard would cover the slider.
    if (window.matchMedia("(pointer: fine)").matches) (f.info ? next : ref).current?.focus({ preventScroll: true });
  }, [f.info]);
  const commit = () => {
    const n = Number(text.replace(/[^\d.]/g, ""));
    onChange(Number.isFinite(n) && text.trim() !== "" ? clampTyped(Math.round(n), f) : value);
  };
  return (
    <form
      className="p-5 sm:p-6"
      onSubmit={(e) => {
        e.preventDefault();
        commit();
        onNext();
      }}
    >
      {f.info ? (
        <Benchmark f={f} {...f.info(compute(v), v)} value={value} basis={f.basis ?? "Based on industry averages"} />
      ) : (
        <>
      <label htmlFor={`q-${f.key}`} className="block text-[15px] font-medium leading-snug tracking-[-0.01em]">
        {f.question}
      </label>
      <p className="mt-1 text-[12px] text-muted-foreground">{f.hint}</p>

      <div className="mt-6 flex items-baseline justify-center gap-1">
        {f.unit === "usd" && <span className="text-[22px] text-muted-foreground">$</span>}
        <input
          ref={ref}
          id={`q-${f.key}`}
          inputMode="numeric"
          value={f.unit === "count" || f.unit === "usd" ? (Number(text) ? Number(text).toLocaleString("en-US") : text) : text}
          onChange={(e) => setText(e.target.value.replace(/[^\d]/g, ""))}
          onBlur={commit}
          style={{ width: `${Math.max(2, (Number(text) ? Number(text).toLocaleString("en-US") : text).length) + 0.5}ch` }}
          className="bg-transparent text-center text-[36px] font-semibold tabular-nums tracking-tight outline-none"
        />
        {f.unit === "pct" && <span className="text-[22px] text-muted-foreground">%</span>}
      </div>

      <Slider className="mt-4" aria-label={f.label} value={[clamp(value, f)]} min={f.min} max={f.max} step={f.step} onValueChange={([n]) => onChange(n)} />
      <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground">
        <span>{f.format(f.min)}</span>
        <span>{f.format(f.max)}{f.unit === "count" || f.unit === "usd" ? "+" : ""}</span>
      </div>

        </>
      )}

      <div className="mt-6 flex items-center justify-between">
        {onBack ? (
          <button type="button" onClick={onBack} className="flex items-center gap-1 rounded-md px-2 py-1.5 text-[12px] text-white/70 transition-colors hover:bg-white/[0.05] hover:text-white cursor-pointer">
            <ArrowLeft className="size-3.5" /> Back
          </button>
        ) : (
          <span className="text-[11px] text-muted-foreground">Press Enter to continue</span>
        )}
        <button ref={next} type="submit" className="flex h-9 items-center gap-1.5 rounded-md bg-white px-4 text-[12px] font-medium text-zinc-950 transition-colors hover:bg-white/90 cursor-pointer">
          {last ? "See my results" : "Next"} <ArrowRight className="size-3.5" />
        </button>
      </div>
    </form>
  );
}

function Benchmark({ f, fact, yours, value, basis }: { f: Step; fact: string; yours: string; value: number; basis: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">{basis}</p>
      <p className="mt-1 text-[15px] font-medium leading-snug tracking-[-0.01em]">{f.question}</p>
      <div className="mt-5 flex items-baseline justify-center">
        <span className="text-[44px] font-semibold tracking-tight tabular-nums text-yellow-200">{value}</span>
        <span className="ml-0.5 text-[22px] text-yellow-200/70">%</span>
      </div>
      <p className="mx-auto mt-1 max-w-sm text-center text-[13px] leading-relaxed text-white/80">{fact}</p>
      <p className="glass-inset mt-5 rounded-lg px-3.5 py-2.5 text-center text-[12px] text-white/90">{yours}</p>
    </div>
  );
}

function Results({ v, set, onRestart, onBack }: { v: Record<Key, number>; set: (k: Key, n: number) => void; onRestart: () => void; onBack: () => void }) {
  const r = compute(v);
  const [adjust, setAdjust] = useState(false);
  return (
    <div className="p-5 sm:p-6">
      <div className="text-center">
        <p className="text-[12px] text-muted-foreground">Extra gross profit from calls you&apos;re missing</p>
        <AnimatedNumber value={r.profit} format={(n) => usd(n) + "/mo"} className="mt-1 block text-[34px] font-semibold tracking-tight tabular-nums text-yellow-200" />
        <p className="mt-0.5 text-[12px] text-muted-foreground">
          on <AnimatedNumber value={r.revenue} format={usd} className="text-white/85 tabular-nums" /> of additional revenue
        </p>
      </div>

      <dl className="glass-inset mt-5 space-y-2 rounded-lg px-3.5 py-3 text-[12px]">
        <Row label="Unanswered calls" value={r.unanswered} />
        <Row label="Revenue opportunities" value={r.opportunities} />
        <Row label="Estimates booked" value={r.booked} />
        <Row label="Estimates completed" value={r.attended} />
        <Row label="Additional jobs closed" value={r.closed} decimals />
      </dl>

      <div className="mt-3 rounded-lg border border-yellow-300/20 bg-yellow-300/[0.04] px-3.5 py-3">
        <div className="flex items-baseline justify-between">
          <span className="text-[13px] font-medium">Your price</span>
          <span className="text-[20px] font-semibold tracking-tight tabular-nums">
            <AnimatedNumber value={r.fee} format={usd} />
            <span className="ml-0.5 text-[11px] font-normal text-muted-foreground">/mo</span>
          </span>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">30% of the projected extra gross profit, rounded to the nearest $250.</p>
        <Separator className="my-2.5 bg-white/[0.06]" />
        <div className="flex items-center justify-between text-[12px]">
          <span className="text-muted-foreground">You keep</span>
          <AnimatedNumber value={r.net} format={(n) => usd(n) + "/mo"} className="font-medium tabular-nums text-yellow-100" />
        </div>
      </div>

      <a href={site.bookUrl} className="mt-4 flex h-10 items-center justify-center gap-1.5 rounded-md bg-white text-[13px] font-medium text-zinc-950 transition-colors hover:bg-white/90">
        <CalendarDays className="size-3.5" /> Book a call to recover it
      </a>

      <div className="mt-3 flex items-center justify-center gap-1 text-[12px]">
        <button onClick={() => setAdjust((a) => !a)} className="flex items-center gap-1.5 rounded-md px-2 py-1 text-white/70 transition-colors hover:bg-white/[0.05] hover:text-white cursor-pointer">
          <SlidersHorizontal className="size-3.5" /> {adjust ? "Hide numbers" : "Adjust numbers"}
        </button>
        <button onClick={onBack} className="flex items-center gap-1.5 rounded-md px-2 py-1 text-white/70 transition-colors hover:bg-white/[0.05] hover:text-white cursor-pointer">
          <ArrowLeft className="size-3.5" /> Back
        </button>
        <button onClick={onRestart} className="flex items-center gap-1.5 rounded-md px-2 py-1 text-white/70 transition-colors hover:bg-white/[0.05] hover:text-white cursor-pointer">
          <RotateCcw className="size-3" /> Start over
        </button>
      </div>

      <AnimatePresence initial={false}>
        {adjust && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-4 pt-5">
              {INPUTS.map((f) => (
                <Field key={f.key} label={f.label} hint={f.hint} value={<span className="tabular-nums">{f.format(v[f.key])}</span>}>
                  <Slider aria-label={f.label} value={[clamp(v[f.key], f)]} min={f.min} max={f.max} step={f.step} onValueChange={([n]) => set(f.key, n)} />
                </Field>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-5 text-center text-[10px] leading-relaxed text-muted-foreground">
        Illustrative estimates, not guaranteed results. Assumes missed opportunities can be recovered and are incremental.
      </p>
    </div>
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
