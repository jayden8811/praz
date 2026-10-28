import { Overview } from "@/components/sections/overview";
import { Pricing } from "@/components/sections/pricing";
import { Footer } from "@/components/sections/footer";

export default function Home() {
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
