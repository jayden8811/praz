import type { Metadata } from "next";
import { OwnerSuite } from "@/components/owner/owner-suite";

export const metadata: Metadata = { title: "Owner suite — Praz", robots: { index: false, follow: false } };

export default function Page() {
  return <OwnerSuite />;
}
