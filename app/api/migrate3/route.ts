import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
export async function GET() {
  try {
    await db.query(`ALTER TABLE product_drafts ALTER COLUMN image_urls TYPE JSONB USING CASE WHEN image_urls IS NULL THEN '[]'::jsonb WHEN image_urls::text LIKE '[%' THEN image_urls::jsonb ELSE '[]'::jsonb END`);
    return NextResponse.json({ done: true });
  } catch(e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
