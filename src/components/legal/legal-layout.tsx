import { LogoMark } from "@/components/logo";
import { legal } from "@/lib/legal";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export type LegalSection = { id: string; title: string; body: React.ReactNode };

export function LegalLayout({ title, intro, sections }: { title: string; intro: React.ReactNode; sections: LegalSection[] }) {
  return (
    <div className="relative flex min-h-svh flex-col">
      <header className="flex items-center justify-between px-4 py-3 md:px-5">
        <a href={site.homeUrl} className="text-[13px] font-medium text-white/90 hover:text-white">
          Praz
        </a>
        <nav className="flex items-center gap-1 text-[12px]">
          <a href={site.termsUrl} className="rounded-md px-2.5 py-1 text-white/70 transition-colors hover:bg-white/[0.05] hover:text-white">
            Terms
          </a>
          <a href={site.privacyUrl} className="rounded-md px-2.5 py-1 text-white/70 transition-colors hover:bg-white/[0.05] hover:text-white">
            Privacy
          </a>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-[720px] flex-1 px-4 pb-24 pt-12 md:pt-16">
        <div className="flex flex-col items-center text-center">
          <LogoMark className="size-10 text-white" />
          <h1 className="mt-5 text-balance text-[24px] font-medium tracking-[-0.02em]">{title}</h1>
          <p className="mt-1.5 text-[12px] text-muted-foreground">Effective {legal.effectiveDate}</p>
        </div>

        <div className="mt-10 text-[14px] leading-7 text-white/75">{intro}</div>

        <nav aria-label="Contents" className="glass mt-8 rounded-xl px-5 py-4">
          <p className="text-[12px] font-medium text-white/90">Contents</p>
          <ol className="mt-2 grid gap-x-6 gap-y-1 text-[12px] sm:grid-cols-2">
            {sections.map((s, i) => (
              <li key={s.id} className="flex gap-2">
                <span className="w-5 shrink-0 tabular-nums text-muted-foreground">{i + 1}.</span>
                <a href={`#${s.id}`} className="text-white/70 transition-colors hover:text-white">
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-4">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-6 pt-10">
              <h2 className="text-[16px] font-medium tracking-[-0.01em] text-white">
                <span className="mr-2 tabular-nums text-muted-foreground">{i + 1}.</span>
                {s.title}
              </h2>
              <div className="mt-3 space-y-4 text-[14px] leading-7 text-white/75">{s.body}</div>
            </section>
          ))}
        </div>
      </main>

      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-[720px] flex-col items-center justify-between gap-2 px-4 py-6 text-[11px] text-muted-foreground sm:flex-row">
          <p>
            © {new Date().getFullYear()} {legal.company}
          </p>
          <p>
            Questions? <A href={`mailto:${legal.legalEmail}`}>{legal.legalEmail}</A>
          </p>
        </div>
      </footer>
    </div>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return <p>{children}</p>;
}

export function UL({ items, className }: { items: React.ReactNode[]; className?: string }) {
  return (
    <ul className={cn("space-y-2 pl-5", className)}>
      {items.map((item, i) => (
        <li key={i} className="list-disc marker:text-white/30">
          {item}
        </li>
      ))}
    </ul>
  );
}

export function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="pt-2 text-[14px] font-medium text-white/90">{children}</h3>;
}

export function A({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="text-white underline decoration-white/30 underline-offset-4 transition-colors hover:decoration-yellow-300">
      {children}
    </a>
  );
}

/** Text that must stand out, such as disclaimers and waivers. */
export function Caps({ children }: { children: React.ReactNode }) {
  return <p className="uppercase tracking-[0.01em] text-white/85">{children}</p>;
}
