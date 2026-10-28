import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-20 w-full rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-2 text-[13px] leading-relaxed text-foreground outline-none transition-[color,box-shadow,border-color] placeholder:text-muted-foreground/70 selection:bg-yellow-300/30",
        "focus-visible:border-yellow-300/40 focus-visible:ring-2 focus-visible:ring-yellow-300/15",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
