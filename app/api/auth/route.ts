import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { action, email, password, name } = await req.json();

    if (action === "register") {
      const existing = await db.query("SELECT id FROM customers WHERE email=$1", [email]);
      if (existing.rows.length > 0) {
        return NextResponse.json({ error: "Email already exists" }, { status: 400 });
      }
      const hash = await bcrypt.hash(password, 10);
      const result = await db.query(
        "INSERT INTO customers (name, email, password_hash, created_at) VALUES ($1,$2,$3,NOW()) RETURNING id, name, email",
        [name, email, hash]
      );
      return NextResponse.json({ success: true, user: result.rows[0] });
    }

    if (action === "login") {
      const result = await db.query("SELECT * FROM customers WHERE email=$1", [email]);
      if (result.rows.length === 0) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
      const user = result.rows[0];
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
