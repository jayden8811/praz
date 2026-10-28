import { Logo } from "@/components/logo";

export function Footer() {
  return (
    <footer className="relative pt-10">
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
