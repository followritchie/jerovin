import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get("email");
    if (!email) return NextResponse.json([], { status: 400 });
    const result = await db.query(
      "SELECT * FROM wishlist_items WHERE customer_email=$1 ORDER BY added_at DESC",
      [email]
    );
    return NextResponse.json(result.rows);
  } catch (error: any) {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, productId, productName, productImage, productPrice } = await req.json();
    if (!email || !productId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    await db.query(
      `INSERT INTO wishlist_items (customer_email, product_id, product_name, product_image, product_price)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (customer_email, product_id) DO NOTHING`,
      [email, productId, productName, productImage, productPrice]
    );
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get("email");
    const productId = req.nextUrl.searchParams.get("productId");
    if (!email || !productId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    await db.query(
      "DELETE FROM wishlist_items WHERE customer_email=$1 AND product_id=$2",
      [email, productId]
    );
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
