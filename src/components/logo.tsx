import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="264 252 806 775" className={cn("size-5 fill-current", className)} aria-hidden>
      <rect x="580" y="262" width="174" height="177" rx="42" />
      <rect x="395" y="452" width="171" height="173" rx="41" />
      <rect x="580" y="452" width="175" height="176" rx="42" />
      <rect x="768" y="452" width="172" height="173" rx="41" />
      <rect x="274" y="629" width="138" height="138" rx="33" />
      <rect x="922" y="629" width="138" height="138" rx="33" />
      <rect x="580" y="640" width="174" height="166" rx="40" />
      <rect x="429" y="790" width="151" height="143" rx="34" />
      <rect x="755" y="790" width="151" height="143" rx="34" />
      <rect x="350" y="928" width="91" height="89" rx="21" />
      <rect x="892" y="928" width="90" height="89" rx="21" />
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
