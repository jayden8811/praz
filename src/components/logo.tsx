import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-5", className)} aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="6" className="fill-white" />
      <path
        d="M8.5 17V7h4.2a3.3 3.3 0 0 1 0 6.6H8.5"
        className="fill-none stroke-zinc-950"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16.5" cy="16.5" r="1.6" className="fill-yellow-400" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark />
      <span className="text-[15px] font-semibold tracking-tight">praz</span>
    </span>
  );
}
