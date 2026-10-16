import { NextResponse } from "next/server";

import { getCurrentCrmUser } from "@/features/auth/session";

export async function GET() {
  const user = await getCurrentCrmUser();
  return NextResponse.json(
    { authorized: user !== null },
    { headers: { "Cache-Control": "no-store" } },
  );
}
