import { NextResponse } from "next/server";
import { keyProblem, publishableKey } from "@/lib/stripe-server";

// Gives the browser the publishable key at request time, so adding or changing
// keys in the host's settings takes effect without a rebuild.
export const dynamic = "force-dynamic";

export async function GET() {
  const problem = keyProblem();
  if (problem) {
    console.error("stripe config:", problem);
    return NextResponse.json({ publishableKey: null, error: "Payments aren't set up yet." }, { status: 503 });
  }
  return NextResponse.json({ publishableKey: publishableKey() });
}
