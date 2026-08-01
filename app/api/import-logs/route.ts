import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";

export async function GET() {
  try {
    const result = await db.query("SELECT * FROM import_logs ORDER BY created_at DESC LIMIT 50");
    return NextResponse.json(result.rows);
  } catch (error: any) {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { sellerName, source, imagesImported, productsCreated, errors } = await req.json();
    const result = await db.query(
      "INSERT INTO import_logs (seller_name, source, images_imported, products_created, status, errors, created_at) VALUES ($1,$2,$3,$4,'completed',$5,NOW()) RETURNING id",
      [sellerName || "Manual", source || "manual", imagesImported || 0, productsCreated || 0, errors || null]
    );
    return NextResponse.json({ success: true, id: result.rows[0].id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
