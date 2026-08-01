import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
export async function GET() {
  try {
    await db.query(`ALTER TABLE product_drafts ALTER COLUMN image_urls TYPE TEXT[] USING CASE WHEN image_urls IS NULL THEN ARRAY[]::TEXT[] ELSE image_urls::TEXT[] END`);
    return NextResponse.json({ done: true, message: "image_urls is now text[]" });
  } catch(e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
