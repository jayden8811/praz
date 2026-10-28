"use client";

import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { CtaGroup } from "@/components/cta-group";
import { Highlight } from "@/components/highlight";

const ease = [0.22, 1, 0.36, 1] as const;

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 10, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 0.7, delay, ease },
});

const stats = [
  { k: "$10k+", v: "client LTV" },
  { k: "100%", v: "done for you" },
  { k: "< 7 days", v: "to launch" },
];

export function Hero() {
  return (
    <section className="relative pt-32 pb-8 md:pt-36 md:pb-10">
      <div className="relative mx-auto flex max-w-2xl flex-col items-center px-4 text-center">
        <motion.div {...fade(0)}>
          <Badge variant="secondary">Done-for-you outbound</Badge>
        </motion.div>

        <motion.h1
          {...fade(0.08)}
          className="mt-5 text-balance text-3xl font-semibold leading-[1.1] tracking-[-0.03em] md:text-[2.75rem]"
        >
          High-ticket meetings.
          <br />
          <Highlight delay={800}>Zero effort.</Highlight>
        </motion.h1>

        <motion.p {...fade(0.16)} className="mt-4 text-sm text-muted-foreground">
          We run your cold email. <b className="font-medium text-white">You take the calls.</b>
        </motion.p>

        <motion.div {...fade(0.24)} className="mt-7">
          <CtaGroup />
        </motion.div>

        <motion.dl {...fade(0.32)} className="mt-10 grid w-full max-w-md grid-cols-3 gap-2">
          {stats.map((s) => (
            <div key={s.k} className="glass rounded-lg px-3 py-3">
              <dt className="text-sm font-semibold tracking-tight">{s.k}</dt>
              <dd className="mt-0.5 text-[11px] text-muted-foreground">{s.v}</dd>
            </div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}
