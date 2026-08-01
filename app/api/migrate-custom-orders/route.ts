import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
export async function GET() {
  const results: string[] = [];
  const cols: [string,string][] = [
    ["color","TEXT"],
    ["custom_details","JSONB"],
    ["reference_image_url","TEXT"],
    ["reference_image_urls","TEXT[]"],
    ["special_instructions","TEXT"],
  ];
  for (const [col,type] of cols) {
    try {
      await db.query(`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS ${col} ${type}`);
      results.push(`✓ order_items.${col}`);
    } catch (e: any) {
      results.push(`✗ order_items.${col}: ${e.message}`);
    }
  }
  return NextResponse.json({ success: true, results });
}
