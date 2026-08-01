import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";

export async function GET() {
  try {
    const result = await db.query(
      `SELECT c.id, c.name, c.email, c.phone, c.country, c.created_at,
      COUNT(DISTINCT o.id)::int as order_count,
      COALESCE(SUM(o.total_inr), 0)::float as total_spent
      FROM customers c
      LEFT JOIN orders o ON o.customer_id = c.id
      GROUP BY c.id
      ORDER BY c.created_at DESC`
    );
    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error("GET customers error:", error.message);
    return NextResponse.json([], { status: 500 });
  }
}
