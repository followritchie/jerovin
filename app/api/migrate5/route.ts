import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
export async function GET() {
  try {
    await db.query(`UPDATE products SET is_active = true WHERE is_active IS NULL OR is_active = false`);
    await db.query(`UPDATE products SET is_approved = true WHERE is_approved IS NULL`);
    const count = await db.query(`SELECT COUNT(*) FROM products WHERE is_active = true`);
    return NextResponse.json({ success: true, active_products: count.rows[0].count });
  } catch(e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
