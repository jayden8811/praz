import { Nav } from "@/components/sections/nav";
import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Roi } from "@/components/sections/roi";
import { Pricing } from "@/components/sections/pricing";
import { Footer } from "@/components/sections/footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <HowItWorks />
        <Roi />
        <Pricing />
      </main>
      <Footer />
    </>
  );
}
