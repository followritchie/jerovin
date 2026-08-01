import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get("email");
    if (!email) return NextResponse.json([], { status: 400 });
    const result = await db.query(
      "SELECT * FROM customer_addresses WHERE customer_email=$1 ORDER BY is_default DESC, created_at DESC",
      [email]
    );
    return NextResponse.json(result.rows);
  } catch (error: any) {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, label, fullName, phone, addressLine1, addressLine2, city, state, postalCode, country, isDefault } = body;
    if (!email || !fullName || !addressLine1 || !city || !country) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (isDefault) {
      await db.query("UPDATE customer_addresses SET is_default=false WHERE customer_email=$1", [email]);
    }
    const result = await db.query(
      `INSERT INTO customer_addresses
       (customer_email, label, full_name, phone, address_line1, address_line2, city, state, postal_code, country, is_default)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
      [email, label || "Home", fullName, phone, addressLine1, addressLine2 || "", city, state || "", postalCode || "", country, !!isDefault]
    );
    return NextResponse.json({ success: true, id: result.rows[0].id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await db.query("DELETE FROM customer_addresses WHERE id=$1", [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
