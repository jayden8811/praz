import { NextResponse } from "next/server";
import { verifiedUser } from "@/lib/server-auth";
import { keyProblem } from "@/lib/stripe-server";

/** Resolves the signed-in user for billing routes, or the response to send instead. */
export async function billingUser(req: Request) {
  const problem = keyProblem();
  if (problem) {
    console.error("stripe config:", problem);
    return { error: NextResponse.json({ error: "Billing isn't available right now." }, { status: 503 }) };
  }
  const user = await verifiedUser(req);
  if (!user) return { error: NextResponse.json({ error: "Please log in again." }, { status: 401 }) };
  return { user };
}
