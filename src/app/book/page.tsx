import type { Metadata } from "next";
import { BookingFlow } from "@/components/booking/booking-flow";

export const metadata: Metadata = { title: "Book a call — Praz" };

export default function Page() {
  return <BookingFlow />;
}
