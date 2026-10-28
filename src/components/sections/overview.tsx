"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUpRight,
  CalendarDays,
  CircleDollarSign,
  Clock,
  Info,
  Lock,
  MessageCircle,
  Percent,
  Send,
  Tag,
  Wallet,
} from "lucide-react";
import { LogoMark } from "@/components/logo";
import { AnimatedNumber } from "@/components/animated-number";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatVolume, pricing, site, volumes } from "@/lib/site";
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
  { k: "< 7 days", v: "To launch" },
  { k: "100%", v: "Done for you" },
  { k: "$0", v: "Setup fees" },
];

const int = (n: number) => Math.round(n).toLocaleString("en-US");
const usd = (n: number) => "$" + int(n);
const dec = (n: number) => (Math.round(n * 10) / 10).toLocaleString("en-US");

export function Overview() {
  return (
    <section className="relative flex min-h-svh flex-col">
      <TopBar />
      <div className="mx-auto flex w-full max-w-[600px] flex-1 flex-col px-4 pb-10 pt-6 md:pt-8">
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
  const items = [
    { href: site.checkoutUrl, label: "Start now", icon: ArrowUpRight },
    { href: "#pricing", label: "Pricing", icon: Tag },
    { href: site.loginUrl, label: "Log in", icon: Lock },
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
        {items.map(({ href, label, icon: Icon }) => (
          <a
            key={label}
            href={href}
            className="hidden items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] text-white/70 transition-colors hover:bg-white/[0.05] hover:text-white sm:flex"
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
        className="glass flex size-[68px] items-center justify-center rounded-full"
      >
        <LogoMark className="size-9" />
      </motion.div>

      <motion.h1
        {...fade(0.1)}
        className="mt-4 flex flex-wrap items-center justify-center gap-x-[0.3em] text-[22px] font-medium tracking-[-0.02em] md:text-[24px]"
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
        <Send className="size-[0.8em] -rotate-12 text-white/50" />
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
      className="glass mt-7 grid grid-cols-3 rounded-xl py-1 sm:grid-cols-5"
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
  const [volIdx, setVolIdx] = useState(0);
  const [ltv, setLtv] = useState(50000);
  const [close, setClose] = useState(20);

  const perDay = volumes[volIdx];
  const cost = pricing[perDay];
  const sent = perDay * ASSUME.days;
  const replies = sent * ASSUME.reply;
  const positive = replies * ASSUME.positive;
  const meetings = positive * ASSUME.meeting;
  const deals = meetings * (close / 100);
  const revenue = deals * ltv;
  const roi = ((revenue - cost) / cost) * 100;
  const paybackDays = revenue > 0 ? (cost / revenue) * 30 : 0;

  return (
    <motion.div {...fade(0.34)} id="roi" className="mt-8">
      {/* header row, like "Token activity · Daily Weekly Cumulative" */}
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 whitespace-nowrap text-[13px] font-medium">
          ROI calculator
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="size-3 cursor-help text-white/30 transition-colors hover:text-white/70" />
            </TooltipTrigger>
            <TooltipContent>
              Conservative: 1% reply · 5% positive · 40% book a meeting · 22 sending days/mo
            </TooltipContent>
          </Tooltip>
        </h2>
        <div className="relative flex items-center gap-0.5 text-[12px]">
          {volumes.map((v, i) => (
            <button
              key={v}
              onClick={() => setVolIdx(i)}
              className={cn(
                "relative rounded-md px-2 py-0.5 tabular-nums transition-colors cursor-pointer",
                i === volIdx ? "text-white" : "text-muted-foreground hover:text-white/80"
              )}
            >
              {i === volIdx && (
                <motion.span
                  layoutId="vol-pill"
                  className="absolute inset-0 rounded-md bg-white/[0.07]"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative">
                {formatVolume(v)}
                <span className="max-sm:hidden">/day</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* inputs — the glass panel that replaces the heatmap */}
      <div className="glass mt-3 grid gap-5 rounded-xl px-4 py-4 sm:grid-cols-2">
        <SliderField
          id="ltv"
          label="Average client LTV"
          value={usd(ltv)}
          min={10000}
          max={500000}
          step={5000}
          current={ltv}
          onChange={setLtv}
          range={["$10k", "$500k"]}
        />
        <SliderField
          id="close"
          label="Close rate from meetings"
          value={`${close}%`}
          min={5}
          max={50}
          step={1}
          current={close}
          onChange={setClose}
          range={["5%", "50%"]}
        />
      </div>

      {/* two columns, like "Activity insights" / "Most used plugins" */}
      <div className="mt-7 grid gap-7 sm:grid-cols-2 sm:gap-8">
        <div>
          <h3 className="text-[13px] font-medium">Projected monthly</h3>
          <dl className="mt-2">
            <Row label="Emails sent" value={<AnimatedNumber value={sent} format={int} />} />
            <Row label="Total replies" value={<AnimatedNumber value={replies} format={int} />} />
            <Row label="Positive replies" value={<AnimatedNumber value={positive} format={int} />} />
            <Row label="Meetings booked" value={<AnimatedNumber value={meetings} format={dec} />} />
            <Row label="Deals closed" value={<AnimatedNumber value={deals} format={dec} />} />
          </dl>
        </div>
        <div>
          <h3 className="text-[13px] font-medium">Your return</h3>
          <dl className="mt-2">
            <Row icon={CircleDollarSign} label="Revenue" value={<AnimatedNumber value={revenue} format={usd} />} />
            <Row icon={Wallet} label="Praz, fully managed" value={<AnimatedNumber value={cost} format={(n) => usd(n) + "/mo"} />} muted />
            <Row icon={Clock} label="Pays for itself in" value={<AnimatedNumber value={paybackDays} format={(n) => dec(n) + " days"} />} muted />
            <Row
              icon={Percent}
              label="ROI"
              value={
                <span className={cn("rounded px-1.5 py-0.5", roi >= 0 ? "bg-yellow-300/20 text-white" : "text-red-300")}>
                  <AnimatedNumber value={roi} format={(n) => int(n) + "%"} />
                </span>
              }
            />
            <div className="pt-2">
              <a
                href={site.bookUrl}
                className="group flex h-8 w-full items-center justify-center gap-1.5 rounded-md bg-white text-[12px] font-medium text-zinc-950 transition-all hover:bg-white/90 active:scale-[0.98]"
              >
                Book a Call
                <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:-translate-y-px group-hover:translate-x-px" />
              </a>
            </div>
          </dl>
        </div>
      </div>
    </motion.div>
  );
}

function SliderField({
  id,
  label,
  value,
  min,
  max,
  step,
  current,
  onChange,
  range,
}: {
  id: string;
  label: string;
  value: string;
  min: number;
  max: number;
  step: number;
  current: number;
  onChange: (v: number) => void;
  range: [string, string];
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-[12px]">
        <label htmlFor={id} className="text-muted-foreground">
          {label}
        </label>
        <span className="font-medium tabular-nums">{value}</span>
      </div>
      <Slider id={id} value={[current]} min={min} max={max} step={step} onValueChange={([v]) => onChange(v)} />
      <div className="mt-1 flex justify-between text-[10px] text-muted-foreground/70">
        <span>{range[0]}</span>
        <span>{range[1]}</span>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  icon: Icon,
  muted,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  muted?: boolean;
}) {
  return (
    <div className="flex h-[30px] items-center justify-between text-[13px]">
      <dt className="flex items-center gap-2 text-muted-foreground">
        {Icon && (
          <span className="flex size-5 items-center justify-center rounded-md bg-white/[0.06]">
            <Icon className="size-3 text-white/80" />
          </span>
        )}
        <span className={cn(Icon && "text-white/90")}>{label}</span>
      </dt>
      <dd className={cn("tabular-nums", muted ? "text-muted-foreground" : "text-white")}>{value}</dd>
    </div>
  );
}
