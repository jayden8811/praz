import { Logo } from "@/components/logo";
import { Reveal } from "@/components/reveal";
import { Highlight } from "@/components/highlight";
import { CtaGroup } from "@/components/cta-group";

export function Footer() {
  return (
    <footer className="relative pt-10">
      <Reveal className="mx-auto max-w-xl px-4 pb-24 text-center">
        <h2 className="text-balance text-2xl font-semibold tracking-[-0.03em] md:text-3xl">
          Your next client is already in our database.{" "}
          <Highlight>Let&apos;s go get them.</Highlight>
        </h2>
        <CtaGroup className="mt-8" />
      </Reveal>
      <div className="border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-4 py-6 text-[11px] text-muted-foreground md:flex-row">
          <Logo />
          <p>© {new Date().getFullYear()} Praz. Done-for-you outbound for high-ticket B2B.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
