import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
export async function GET() {
  try {
    await db.query(`CREATE TABLE IF NOT EXISTS product_drafts (id SERIAL PRIMARY KEY,name TEXT NOT NULL,description TEXT,price_inr DECIMAL(12,2) NOT NULL,compare_price_inr DECIMAL(12,2),category_id TEXT,brand TEXT DEFAULT 'Jerovin',sku TEXT,stock INTEGER DEFAULT 0,shipping_type TEXT DEFAULT 'free',india_shipping DECIMAL(12,2) DEFAULT 0,international_shipping DECIMAL(12,2) DEFAULT 2800,is_custom BOOLEAN DEFAULT false,seo_title TEXT,seo_description TEXT,tags TEXT,image_urls JSONB DEFAULT '[]',status TEXT DEFAULT 'draft',created_at TIMESTAMP DEFAULT NOW(),updated_at TIMESTAMP DEFAULT NOW())`);
    await db.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true`);
    await db.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT true`);
    await db.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS brand TEXT DEFAULT 'Jerovin'`);
    await db.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP`);
    await db.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS compare_price_inr DECIMAL(12,2)`);
    await db.query(`UPDATE products SET is_active=true WHERE is_active IS NULL`);
    return NextResponse.json({ success: true, message: "Migration complete" });
  } catch(error:any){ return NextResponse.json({ error: error.message },{status:500}); }
}
