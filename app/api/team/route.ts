import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import bcrypt from "bcryptjs";
import { sendTeamInviteEmail } from "@/app/lib/mailer";

const ROLES: Record<number, { name: string; desc: string }> = {
  1: { name: "Super Admin", desc: "Full access" },
  2: { name: "Admin", desc: "Products, orders, reports" },
  3: { name: "Product Manager", desc: "Products only" },
  4: { name: "Order Manager", desc: "Orders only" },
  5: { name: "Finance Manager", desc: "Reports only" },
  6: { name: "Seller", desc: "Own products" },
  7: { name: "Support Staff", desc: "Orders & customers" },
};

export async function GET() {
  try {
    const result = await db.query(
      `SELECT u.id, u.name, u.email, u.is_active, u.created_at, u.last_login,
      r.name as role_name, r.id as role_id
      FROM users u
      LEFT JOIN roles r ON r.id = u.role_id
      ORDER BY u.created_at DESC`
    );
    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error("GET team error:", error.message);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, roleId } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 });
    }
    const existing = await db.query("SELECT id FROM users WHERE email=$1", [email]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }
    const resolvedRoleId = roleId || 2;
    const hash = await bcrypt.hash(password, 10);
    const result = await db.query(
      "INSERT INTO users (name, email, password_hash, role_id, is_active, created_at) VALUES ($1,$2,$3,$4,true,NOW()) RETURNING id",
      [name, email, hash, resolvedRoleId]
    );

    const role = ROLES[resolvedRoleId] || ROLES[2];
    try {
      await sendTeamInviteEmail({
        toEmail: email,
        toName: name,
        role,
        tempPassword: password,
        loginUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/admin/login`,
      });
    } catch (mailErr: any) {
      console.error("Invite email failed to send:", mailErr.message);
      // Member is still created even if the email fails — don't block on this.
    }

    return NextResponse.json({ success: true, id: result.rows[0].id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, isActive, roleId } = await req.json();
    await db.query(
      "UPDATE users SET is_active=$1, role_id=COALESCE($2, role_id), updated_at=NOW() WHERE id=$3",
      [isActive, roleId || null, id]
    );
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    await db.query("DELETE FROM users WHERE id=$1", [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
