import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
export async function GET() {
  const cols = [
    "ALTER TABLE product_drafts ADD COLUMN IF NOT EXISTS india_shipping DECIMAL(12,2) DEFAULT 0",
    "ALTER TABLE product_drafts ADD COLUMN IF NOT EXISTS international_shipping DECIMAL(12,2) DEFAULT 2800",
    "ALTER TABLE product_drafts ADD COLUMN IF NOT EXISTS shipping_type TEXT DEFAULT 'free'",
    "ALTER TABLE product_drafts ADD COLUMN IF NOT EXISTS brand TEXT DEFAULT 'Jerovin'",
    "ALTER TABLE product_drafts ADD COLUMN IF NOT EXISTS sku TEXT",
    "ALTER TABLE product_drafts ADD COLUMN IF NOT EXISTS is_custom BOOLEAN DEFAULT false",
    "ALTER TABLE product_drafts ADD COLUMN IF NOT EXISTS seo_title TEXT",
    "ALTER TABLE product_drafts ADD COLUMN IF NOT EXISTS seo_description TEXT",
    "ALTER TABLE product_drafts ADD COLUMN IF NOT EXISTS tags TEXT",
    "ALTER TABLE product_drafts ADD COLUMN IF NOT EXISTS image_urls JSONB DEFAULT '[]'",
    "ALTER TABLE product_drafts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft'",
    "ALTER TABLE product_drafts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP",
    "ALTER TABLE product_drafts ADD COLUMN IF NOT EXISTS compare_price_inr DECIMAL(12,2)",
    "ALTER TABLE product_drafts ADD COLUMN IF NOT EXISTS category_id TEXT",
    "ALTER TABLE product_drafts ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0",
  ];
  const results: any[] = [];
  for (const sql of cols) {
    try { await db.query(sql); results.push({ ok: true, sql: sql.slice(0,60) }); }
    catch(e: any) { results.push({ ok: false, sql: sql.slice(0,60), err: e.message }); }
  }
  return NextResponse.json({ done: true, results });
}
