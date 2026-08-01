import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action || body.mode;
    const { email, password, name, phone } = body;

    if (action === "register") {
      const existing = await db.query("SELECT id FROM customers WHERE email=$1", [email]);
      if (existing.rows.length > 0) {
        return NextResponse.json({ error: "Email already exists" }, { status: 400 });
      }
      const hash = await bcrypt.hash(password, 10);
      const result = await db.query(
        "INSERT INTO customers (name, email, phone, password_hash, created_at) VALUES ($1,$2,$3,$4,NOW()) RETURNING id, name, email, phone",
        [name, email, phone || null, hash]
      );
      return NextResponse.json({ success: true, user: result.rows[0] });
    }

    if (action === "login") {
      const result = await db.query("SELECT * FROM customers WHERE email=$1", [email]);
      if (result.rows.length === 0) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
      const user = result.rows[0];
      if (!user.password_hash) {
        return NextResponse.json({ error: "This account uses Google or phone sign-in. Try that instead." }, { status: 401 });
      }
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email, phone: user.phone } });
    }

    if (action === "google") {
      if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });
      const existing = await db.query("SELECT * FROM customers WHERE email=$1", [email]);
      if (existing.rows.length > 0) {
        const user = existing.rows[0];
        return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email, phone: user.phone } });
      }
      const result = await db.query(
        "INSERT INTO customers (name, email, created_at) VALUES ($1,$2,NOW()) RETURNING id, name, email, phone",
        [name || email.split("@")[0], email]
      );
      return NextResponse.json({ success: true, user: result.rows[0] });
    }

    if (action === "phone-verify") {
      if (!phone) return NextResponse.json({ error: "Phone required" }, { status: 400 });
      const existing = await db.query("SELECT * FROM customers WHERE phone=$1", [phone]);
      if (existing.rows.length > 0) {
        const user = existing.rows[0];
        return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email, phone: user.phone } });
      }
      const result = await db.query(
        "INSERT INTO customers (name, phone, created_at) VALUES ($1,$2,NOW()) RETURNING id, name, email, phone",
        [name || "Customer", phone]
      );
      return NextResponse.json({ success: true, user: result.rows[0] });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Auth route error:", error.message);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
