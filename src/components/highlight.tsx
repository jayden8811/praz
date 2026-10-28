"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import { cn } from "@/lib/utils";

/** Semi-transparent yellow marker that sweeps in when scrolled into view. */
export function Highlight({
  children,
  delay = 250,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => setOn(true), delay);
    return () => clearTimeout(t);
  }, [inView, delay]);

  return (
    <mark ref={ref} data-on={on} className={cn("hl bg-transparent", className)}>
      {children}
    </mark>
  );
}
