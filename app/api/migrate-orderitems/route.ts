import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";

export async function GET() {
  try {
    await db.query(`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS size TEXT`);
    await db.query(`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS color TEXT`);
    await db.query(`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW()`);
    return NextResponse.json({ success: true, message: "order_items columns added" });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
