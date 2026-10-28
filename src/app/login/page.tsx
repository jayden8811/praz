import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "Log in — Praz" };

export default function Page() {
  return <LoginForm />;
}
