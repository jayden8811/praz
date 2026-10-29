import { NextResponse } from "next/server";
import { verifiedOwner } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

// 200 when the signed-in user is an owner, so login can send them to /owner.
export async function GET(req: Request) {
  const owner = await verifiedOwner(req);
  return owner ? NextResponse.json({ owner: true }) : NextResponse.json({ owner: false }, { status: 403 });
}
