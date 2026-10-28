import { Nav } from "@/components/sections/nav";
import { Hero } from "@/components/sections/hero";
import { Roi } from "@/components/sections/roi";
import { Pricing } from "@/components/sections/pricing";
import { Footer } from "@/components/sections/footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Roi />
        <Pricing />
      </main>
      <Footer />
    </>
  );
}
