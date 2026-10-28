import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export function CtaGroup({
  className,
  secondaryHref = "#pricing",
  secondaryLabel = "See Pricing",
  note,
}: {
  className?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  note?: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className="flex items-center gap-2">
        <Button asChild size="lg" className="group">
          <a href={site.bookUrl}>
            Book a Call
            <ArrowRight className="transition-transform duration-300 group-hover:translate-x-0.5" />
          </a>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <a href={secondaryHref}>{secondaryLabel}</a>
        </Button>
      </div>
      {note && <p className="text-xs text-muted-foreground">{note}</p>}
      <StartNow />
    </div>
  );
}

export function StartNow({ className }: { className?: string }) {
  return (
    <a
      href={site.checkoutUrl}
      className={cn(
        "group glass inline-flex flex-col items-center rounded-lg px-5 py-2 transition-all duration-300 hover:border-yellow-300/25 hover:bg-white/[0.06]",
        className
      )}
    >
      <span className="flex items-center gap-1 text-[13px] font-medium text-yellow-100">
        Or start now
        <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </span>
      <span className="text-[11px] text-muted-foreground">
        skip the call, onboard in 5 minutes
      </span>
    </a>
  );
}
