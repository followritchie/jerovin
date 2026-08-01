import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";

export async function GET(req: NextRequest) {
  try {
    const entityType = req.nextUrl.searchParams.get("entityType");
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "100");
    let query = "SELECT * FROM audit_logs";
    const params: any[] = [];
    if (entityType) {
      query += " WHERE entity_type=$1";
      params.push(entityType);
    }
    query += " ORDER BY created_at DESC LIMIT " + limit;
    const r = await db.query(query, params);
    return NextResponse.json(r.rows);
  } catch (e: any) {
    return NextResponse.json([], { status: 500 });
  }
}
