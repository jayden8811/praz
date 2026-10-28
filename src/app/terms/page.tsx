import type { Metadata } from "next";
import { Terms } from "@/components/legal/terms";

export const metadata: Metadata = { title: "Terms of Service — Praz" };

export default function Page() {
  return <Terms />;
}
