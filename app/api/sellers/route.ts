import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";

export async function GET() {
  try {
    const result = await db.query(
      `SELECT s.*, u.email as user_email
      FROM sellers s
      LEFT JOIN users u ON u.id = s.user_id
      ORDER BY s.created_at DESC`
    );
    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error("GET sellers error:", error.message);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { businessName, businessEmail, phone, address, gstNumber, panNumber, commissionRate } = await req.json();
    if (!businessName || !businessEmail) {
      return NextResponse.json({ error: "Business name and email are required" }, { status: 400 });
    }
    const result = await db.query(
      `INSERT INTO sellers (business_name, business_email, phone, address, gst_number, pan_number, commission_rate, is_approved, created_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,false,NOW()) RETURNING id`,
      [businessName, businessEmail, phone || null, address || null, gstNumber || null, panNumber || null, commissionRate || 15]
    );
    return NextResponse.json({ success: true, id: result.rows[0].id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, isApproved, commissionRate } = await req.json();
    await db.query(
      "UPDATE sellers SET is_approved=$1, commission_rate=COALESCE($2, commission_rate) WHERE id=$3",
      [isApproved, commissionRate || null, id]
    );
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
