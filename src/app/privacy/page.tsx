import type { Metadata } from "next";
import { Privacy } from "@/components/legal/privacy";

export const metadata: Metadata = { title: "Privacy Policy — Praz" };

export default function Page() {
  return <Privacy />;
}
