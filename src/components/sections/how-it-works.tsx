import { Reveal } from "@/components/reveal";
import { Highlight } from "@/components/highlight";
import { CtaGroup } from "@/components/cta-group";
import { DemoPlayer } from "./demo-player";

export function HowItWorks() {
  return (
    <section id="how" className="relative scroll-mt-20 overflow-x-clip py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">How it works</p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.03em] md:text-[2.6rem] md:leading-[1.1]">
            You give us two things.
            <br />
            <span className="text-white/55">We handle </span>
            <Highlight>everything else.</Highlight>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
            Your ideal customer in <b className="font-medium text-white">plain English</b>, and the{" "}
            <b className="font-medium text-white">phone number</b> buyers should reach. That&apos;s the whole job.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-12">
          <DemoPlayer />
        </Reveal>

        <Reveal delay={0.1} className="mt-12">
          <CtaGroup />
        </Reveal>
      </div>
    </section>
  );
}
