import type { Metadata } from "next";
import { ResetForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "New password — Praz" };

export default function Page() {
  return <ResetForm />;
}
