"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  ArrowUpRight,
  BarChart3,
  Database,
  Globe,
  PenLine,
  Send,
  PhoneForwarded,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { AnimatedNumber } from "@/components/animated-number";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { defaultVolumeIndex, formatVolume, pricing, site, volumes } from "@/lib/site";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

// Typical monthly cost to hire or buy each piece separately, as base + per 1k/day of volume.
const stack = [
  { icon: UserRound, label: "Dedicated campaign operator", base: 2000, perK: 500 },
  { icon: Database, label: "Verified high-ticket lead data", base: 0, perK: 400 },
  { icon: Globe, label: "Domains & inboxes, warmed", base: 0, perK: 300 },
  { icon: Send, label: "Sending & warmup platform", base: 60, perK: 40 },
  { icon: PenLine, label: "Copywriting & A/B testing", base: 1000, perK: 0 },
  { icon: PhoneForwarded, label: "Replies routed to your phone", base: 900, perK: 600 },
  { icon: ShieldCheck, label: "Deliverability monitoring", base: 150, perK: 0 },
  { icon: BarChart3, label: "Weekly pipeline reporting", base: 150, perK: 0 },
];
const costAt = (item: (typeof stack)[number], perDay: number) =>
  Math.round((item.base + item.perK * (perDay / 1000)) / 50) * 50;

const usd = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

export function Pricing() {
  const [volIdx, setVolIdx] = useState(defaultVolumeIndex);
  const perDay = volumes[volIdx];
  const price = pricing[perDay];
  const totalValue = stack.reduce((sum, item) => sum + costAt(item, perDay), 0);

  return (
    <section id="pricing" className="relative scroll-mt-10 py-16 md:py-20">
      <motion.div
        initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7, ease }}
        className="mx-auto w-full max-w-[680px] px-4"
      >
        <h2 className="text-center text-[13px] font-medium">Everything included</h2>

        <div className="glass mt-3 rounded-xl p-5">
          {/* value stack */}
          <dl>
            {stack.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -6 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.05, duration: 0.5, ease }}
                className="flex h-[32px] items-center justify-between gap-3 text-[13px]"
              >
                <dt className="flex items-center gap-2.5 text-white/90">
                  <span className="flex size-5 items-center justify-center rounded-md bg-white/[0.06]">
                    <item.icon className="size-3 text-white/80" />
                  </span>
                  {item.label}
                </dt>
                <dd className="tabular-nums text-muted-foreground">
                  <AnimatedNumber value={costAt(item, perDay)} format={(n) => usd(n) + "/mo"} />
                </dd>
              </motion.div>
            ))}
          </dl>

          <Separator className="my-3" />

          <div className="flex items-center justify-between text-[13px]">
            <span className="text-muted-foreground">Typical cost to do it yourself</span>
            <span className="tabular-nums text-muted-foreground line-through decoration-white/40">
              <AnimatedNumber value={totalValue} format={(n) => usd(n) + "/mo"} />
            </span>
          </div>

          {/* volume */}
          <div className="glass-inset mt-5 rounded-lg p-4">
            <div className="mb-2 flex items-center justify-between text-[12px]">
              <label htmlFor="volume" className="text-muted-foreground">
                Daily sending volume
              </label>
              <span className="font-medium tabular-nums">{perDay.toLocaleString("en-US")}/day</span>
            </div>
            <Slider
              id="volume"
              value={[volIdx]}
              min={0}
              max={volumes.length - 1}
              step={1}
              onValueChange={([v]) => setVolIdx(v)}
            />
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
          </div>

          {/* price + cta */}
          <div className="mt-5 flex flex-col items-center text-center">
            <p className="text-[11px] text-muted-foreground">Your price</p>
            <div className="mt-1 flex items-baseline gap-1">
              <AnimatedNumber value={price} format={usd} className="text-3xl font-semibold tracking-tight tabular-nums" />
              <span className="text-[12px] text-muted-foreground">/mo</span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              <span className="rounded bg-yellow-300/20 px-1 text-white">
                Save <AnimatedNumber value={totalValue - price} format={usd} />/mo
              </span>{" "}
              · No setup fees · Cancel anytime
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-1.5">
            <a
              href={site.bookUrl}
              className="group flex h-9 items-center justify-center gap-1.5 rounded-md bg-white text-[12px] font-medium text-zinc-950 transition-all hover:bg-white/90 active:scale-[0.98]"
            >
              Book a Call
              <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:-translate-y-px group-hover:translate-x-px" />
            </a>
            <a
              href={site.onboardingUrl}
              className="flex h-9 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-[12px] font-medium text-yellow-100 transition-colors hover:border-yellow-300/25 hover:bg-white/[0.07]"
            >
              Or start now
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
