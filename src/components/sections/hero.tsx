"use client";

import { motion } from "motion/react";
import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CtaGroup } from "@/components/cta-group";
import { Highlight } from "@/components/highlight";

const ease = [0.22, 1, 0.36, 1] as const;

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 12, filter: "blur(8px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 0.8, delay, ease },
});

const stats = [
  { k: "$10k+", v: "minimum client LTV we take on" },
  { k: "100%", v: "done-for-you, end to end" },
  { k: "98%", v: "inbox deliverability" },
  { k: "< 7 days", v: "to first campaign live" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-12 md:pt-40 md:pb-16">
      {/* backdrop */}
      <div className="grid-bg pointer-events-none absolute inset-0" />
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.6 }}
        className="pointer-events-none absolute left-1/2 top-[-12rem] h-[34rem] w-[60rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(250,204,21,0.10),transparent)] blur-2xl"
      />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-4 text-center">
        <motion.div {...fade(0)}>
          <Badge>
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-yellow-300 opacity-60" />
              <span className="relative inline-flex size-1.5 rounded-full bg-yellow-300" />
            </span>
            Done-for-you outbound for high-ticket B2B
          </Badge>
        </motion.div>

        <motion.h1
          {...fade(0.08)}
          className="mt-6 text-balance text-[2.4rem] font-semibold leading-[1.06] tracking-[-0.035em] md:text-[3.6rem]"
        >
          <span className="text-gradient">Qualified buyers on your calendar.</span>
          <br />
          <span className="text-white">
            <Highlight delay={900}>You just take the calls.</Highlight>
          </span>
        </motion.h1>

        <motion.p
          {...fade(0.16)}
          className="mt-6 max-w-xl text-balance text-sm leading-relaxed text-muted-foreground md:text-[15px]"
        >
          We run your entire cold email engine — <b className="font-medium text-white">leads, domains, inboxes, copy, sending and replies</b> — and
          route interested buyers straight to your phone. Built only for companies
          with <b className="font-medium text-white">high deal sizes and LTV.</b>
        </motion.p>

        <motion.div {...fade(0.24)} className="mt-8">
          <CtaGroup
            note={
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-yellow-200/80" />
                Fully managed by our team. No software to learn.
              </span>
            }
          />
        </motion.div>

        <motion.dl
          {...fade(0.34)}
          className="mt-14 grid w-full grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.06] md:grid-cols-4"
        >
          {stats.map((s) => (
            <div key={s.k} className="bg-background/90 px-4 py-4 text-left backdrop-blur">
              <dt className="text-lg font-semibold tracking-tight">{s.k}</dt>
              <dd className="mt-0.5 text-[11px] text-muted-foreground">{s.v}</dd>
            </div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}
