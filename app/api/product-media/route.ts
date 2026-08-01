import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { productId, url, type, sortOrder } = await req.json();
    await db.query(
      "INSERT INTO product_media (product_id, url, type, sort_order, created_at) VALUES ($1,$2,$3,$4,NOW())",
      [productId, url, type || "image", sortOrder || 0]
    );
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    await db.query("DELETE FROM product_media WHERE id=$1", [id]);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
