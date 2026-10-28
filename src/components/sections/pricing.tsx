"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { Highlight } from "@/components/highlight";
import { AnimatedNumber } from "@/components/animated-number";
import { StartNow } from "@/components/cta-group";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { formatVolume, pricing, site, volumes } from "@/lib/site";
import { cn } from "@/lib/utils";

const features = [
  ["Dedicated operator", "a real person runs and optimizes your campaigns"],
  ["High-ticket targeting", "verified decision-makers at companies that can afford you"],
  ["Copy written for you", "sequences built and A/B tested by our team"],
  ["Domains & inboxes", "registered, configured and warmed. Included"],
  ["Reply management", "we qualify every reply and route buyers to your phone"],
  ["Weekly reporting", "pipeline, meetings and revenue — one short email"],
];

export function Pricing() {
  const [volIdx, setVolIdx] = useState(0);
  const perDay = volumes[volIdx];
  const price = pricing[perDay];

  return (
    <section id="pricing" className="relative scroll-mt-20 py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4">
        <Reveal className="mx-auto max-w-xl text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Pricing</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] md:text-[2.6rem] md:leading-[1.1]">
            One price.
            <br />
            <Highlight>Fully managed.</Highlight>
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Pick your volume. We run the <b className="font-medium text-white">entire outbound engine</b> for you.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-12">
          <div className="glass grid overflow-hidden rounded-xl md:grid-cols-2">
            <div className="p-5 md:p-7">
              <p className="text-xs font-medium text-yellow-200">Done-For-You Outbound</p>
              <div className="mt-2 flex items-baseline gap-1">
                <AnimatedNumber
                  value={price}
                  format={(n) => "$" + Math.round(n).toLocaleString("en-US")}
                  className="text-4xl font-semibold tracking-tight tabular-nums"
                />
                <span className="text-xs text-muted-foreground">/month</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.b
                    key={perDay}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="inline-block font-medium text-white tabular-nums"
                  >
                    {perDay.toLocaleString("en-US")}
                  </motion.b>
                </AnimatePresence>{" "}
                emails per day, managed end to end
              </p>

              <div className="glass-inset mt-6 rounded-lg p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Daily volume</span>
                  <span className="text-xs font-medium tabular-nums">{perDay.toLocaleString("en-US")}/day</span>
                </div>
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
              </div>

              <div className="mt-4 space-y-2 text-xs leading-relaxed text-muted-foreground">
                <p>
                  <b className="font-medium text-white">Infrastructure included.</b> Domains, inboxes, data and tooling — on us.
                </p>
                <p>
                  <b className="font-medium text-white">No setup fees. No extras.</b> Cancel anytime.
                </p>
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <Button asChild size="lg" className="w-full">
                  <a href={site.bookUrl}>Book a Call</a>
                </Button>
                <StartNow className="w-full" />
              </div>
            </div>

            <div className="border-t border-white/[0.06] bg-white/[0.015] p-5 md:border-t-0 md:border-l md:p-7">
              <Badge>Everything included</Badge>
              <p className="mt-4 text-sm font-medium">What we run for you</p>
              <ul className="mt-4 space-y-3.5">
                {features.map(([title, desc], i) => (
                  <motion.li
                    key={title}
                    initial={{ opacity: 0, x: 8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.15 + i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="flex gap-2.5"
                  >
                    <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-yellow-300/10 text-yellow-200">
                      <Check className="size-2.5" />
                    </span>
                    <span className="text-xs leading-relaxed text-muted-foreground">
                      <b className="font-medium text-white">{title}</b> — {desc}
                    </span>
                  </motion.li>
                ))}
              </ul>
              <div className="glass-inset mt-7 rounded-lg px-3.5 py-3 text-[11px] leading-relaxed text-muted-foreground">
                <span className="text-white">Selective by design.</span> We only partner with companies whose deal size or
                LTV is $10k+, so every campaign gets senior attention.
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
