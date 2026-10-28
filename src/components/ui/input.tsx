import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-sm tabular-nums text-foreground shadow-xs outline-none transition-[color,box-shadow,border-color] placeholder:text-muted-foreground selection:bg-yellow-300/30",
        "focus-visible:border-yellow-300/40 focus-visible:ring-2 focus-visible:ring-yellow-300/15",
        "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
        className
      )}
      {...props}
    />
  );
}

export { Input };
