import { NextResponse } from "next/server";

import { getDbPool } from "@/lib/db";

export async function GET() {
  try {
    const pool = getDbPool();
    await pool.query("select 1 as ok");

    return NextResponse.json({
      status: "ok",
      database: "reachable",
    });
  } catch {
    return NextResponse.json(
      {
        status: "error",
        database: "unreachable",
      },
      { status: 503 },
    );
  }
}
