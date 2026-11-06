import type { Metadata } from "next";
import { Overview } from "@/components/sections/overview";
import { Pricing } from "@/components/sections/pricing";
import { Footer } from "@/components/sections/footer";

export const metadata: Metadata = { title: "Done-for-you outbound — Praz" };

export default function Outbound() {
  return (
    <>
      <main>
        <Overview />
        <Pricing />
      </main>
      <Footer />
    </>
  );
}
