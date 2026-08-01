import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
export async function GET() {
  const cols: [string,string,string][] = [
    ["customers","phone","TEXT"],
    ["customers","dob","DATE"],
    ["customers","anniversary","DATE"],
    ["customers","city","TEXT"],
    ["customers","country","TEXT"],
    ["sellers","city","TEXT"],
    ["sellers","country","TEXT"],
    ["sellers","product_categories","TEXT"],
    ["sellers","bank_account","TEXT"],
    ["sellers","ifsc","TEXT"],
    ["sellers","pan_number","TEXT"],
    ["sellers","status","TEXT"],
    ["users","phone","TEXT"],
    ["users","status","TEXT"],
    ["orders","tracking_number","TEXT"],
    ["orders","courier","TEXT"],
  ];
  const results: string[] = [];
  for (const [table, col, type] of cols) {
    try {
      await db.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${col} ${type}`);
      results.push(`✓ ${table}.${col}`);
    } catch (e: any) {
      results.push(`✗ ${table}.${col}: ${e.message}`);
    }
  }
  return NextResponse.json({ success: true, results });
}
