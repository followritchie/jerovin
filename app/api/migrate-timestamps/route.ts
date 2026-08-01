import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";

export async function GET() {
  try {
    await db.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS uploaded_timezone TEXT DEFAULT 'UTC', ADD COLUMN IF NOT EXISTS uploaded_at_local TEXT, ADD COLUMN IF NOT EXISTS uploaded_at_est TEXT`);
    await db.query(`CREATE TABLE IF NOT EXISTS media_library (id SERIAL PRIMARY KEY, url TEXT NOT NULL, name TEXT, type TEXT DEFAULT 'image', size TEXT, category TEXT DEFAULT 'uncategorized', uploaded_at TIMESTAMPTZ DEFAULT NOW(), timezone TEXT DEFAULT 'UTC', uploaded_at_est TEXT, created_at TIMESTAMPTZ DEFAULT NOW())`);
    return NextResponse.json({ success: true, message: "Columns and table created" });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
