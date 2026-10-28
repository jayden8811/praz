"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Info } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { Highlight } from "@/components/highlight";
import { AnimatedNumber } from "@/components/animated-number";
import { StartNow } from "@/components/cta-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatVolume, pricing, site, volumes } from "@/lib/site";
import { cn } from "@/lib/utils";

const ASSUME = { reply: 0.01, positive: 0.05, meeting: 0.4, days: 22 };
const LTV = { min: 10000, max: 500000 };
const CLOSE = { min: 5, max: 50 };

const usd = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));

export function Roi() {
  const [volIdx, setVolIdx] = useState(0);
  const [ltv, setLtv] = useState(50000);
  const [close, setClose] = useState(20);

  const perDay = volumes[volIdx];
  const cost = pricing[perDay];
  const replies = perDay * ASSUME.days * ASSUME.reply;
  const positive = replies * ASSUME.positive;
  const meetings = positive * ASSUME.meeting;
  const deals = meetings * (close / 100);
  const revenue = deals * ltv;
  const roi = ((revenue - cost) / cost) * 100;

  return (
    <section id="roi" className="relative scroll-mt-20 py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4">
        <Reveal className="mx-auto max-w-xl text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">ROI</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] md:text-[2.6rem]">
            Run <Highlight>your numbers.</Highlight>
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            At high deal sizes, <b className="font-medium text-white">one closed client pays for the year.</b>
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-12">
          <div className="glass grid overflow-hidden rounded-xl md:grid-cols-2">
            {/* inputs */}
            <div className="space-y-7 p-5 md:p-7">
              <p className="text-sm font-medium">Your numbers</p>

              <Field
                label="Emails per day"
                hint="Daily sending volume across your managed inboxes."
                value={<span className="tabular-nums">{perDay.toLocaleString("en-US")}/day</span>}
              >
                <Slider value={[volIdx]} min={0} max={volumes.length - 1} step={1} onValueChange={([v]) => setVolIdx(v)} />
                <div className="mt-2 flex justify-between">
                  {volumes.map((v, i) => (
                    <button
                      key={v}
                      onClick={() => setVolIdx(i)}
                      className={cn(
                        "w-8 text-center text-[11px] tabular-nums transition-colors cursor-pointer",
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
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">$</span>
                    <Input
                      type="number"
                      value={ltv}
                      onChange={(e) => setLtv(Number(e.target.value) || 0)}
                      onBlur={() => setLtv((v) => clamp(v, LTV.min, LTV.max))}
                      className="h-7 w-24 text-right text-xs"
                    />
                  </div>
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
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      value={close}
                      onChange={(e) => setClose(Number(e.target.value) || 0)}
                      onBlur={() => setClose((v) => clamp(v, CLOSE.min, CLOSE.max))}
                      className="h-7 w-14 text-right text-xs"
                    />
                    <span className="text-xs text-muted-foreground">%</span>
                  </div>
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

              <div className="glass-inset rounded-lg px-3.5 py-3">
                <p className="text-xs font-medium">Conservative assumptions</p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                  1% reply rate · 5% positive · 40% book a meeting · 22 sending days/mo
                </p>
              </div>
            </div>

            {/* results */}
            <div className="flex flex-col border-t border-white/[0.06] bg-white/[0.015] p-5 md:border-t-0 md:border-l md:p-7">
              <p className="text-sm font-medium">Projected monthly results</p>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <Stat label="Total replies" value={replies} />
                <Stat label="Positive replies" value={positive} accent />
                <Stat label="Meetings booked" value={meetings} />
                <Stat label="Deals closed" value={deals} decimals />
              </div>

              <Separator className="my-6" />

              <div className="flex items-end justify-between">
                <span className="text-xs text-muted-foreground">Projected revenue</span>
                <AnimatedNumber value={revenue} format={usd} className="text-3xl font-semibold tracking-tight tabular-nums" />
              </div>
              <div className="mt-4 space-y-2 text-xs">
                <Row label="Praz (fully managed)" value={<AnimatedNumber value={cost} format={(n) => usd(n) + "/mo"} />} />
                <Row
                  label="ROI"
                  value={
                    <span className={cn("rounded px-1.5 py-0.5 font-medium", roi >= 0 ? "bg-yellow-300/15 text-yellow-100" : "text-red-300")}>
                      <AnimatedNumber value={roi} format={(n) => Math.round(n).toLocaleString("en-US") + "%"} />
                    </span>
                  }
                />
              </div>

              <div className="mt-auto flex flex-col gap-2 pt-7">
                <Button asChild size="lg" className="w-full">
                  <a href={site.bookUrl}>Book a Call</a>
                </Button>
                <StartNow className="w-full" />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
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
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {label}
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="size-3 cursor-help text-white/30 transition-colors hover:text-white/70" />
            </TooltipTrigger>
            <TooltipContent>{hint}</TooltipContent>
          </Tooltip>
        </span>
        <span className="text-xs font-medium">{value}</span>
      </div>
      {children}
    </div>
  );
}

function Range({ a, b }: { a: string; b: string }) {
  return (
    <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
      <span>{a}</span>
      <span>{b}</span>
    </div>
  );
}

function Stat({ label, value, accent, decimals }: { label: string; value: number; accent?: boolean; decimals?: boolean }) {
  return (
    <motion.div layout className="glass-inset rounded-lg px-3.5 py-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <AnimatedNumber
        value={value}
        format={(n) => (decimals ? (Math.round(n * 10) / 10).toLocaleString("en-US") : Math.round(n).toLocaleString("en-US"))}
        className={cn("mt-1 block text-xl font-semibold tabular-nums tracking-tight", accent && "text-yellow-200")}
      />
    </motion.div>
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
