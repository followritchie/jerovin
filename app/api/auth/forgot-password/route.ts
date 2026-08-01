import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import bcrypt from "bcryptjs";
import { sendPasswordResetEmail } from "@/app/lib/mailer";

export async function POST(req: NextRequest) {
  try {
    const { email, code, newPassword } = await req.json();

    if (code && newPassword) {
      const result = await db.query(
        "SELECT * FROM customers WHERE email=$1 AND reset_code=$2 AND reset_code_expires > NOW()",
        [email, code]
      );
      if (result.rows.length === 0) {
        return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
      }
      const hash = await bcrypt.hash(newPassword, 10);
      await db.query(
        "UPDATE customers SET password_hash=$1, reset_code=NULL, reset_code_expires=NULL WHERE email=$2",
        [hash, email]
      );
      return NextResponse.json({ success: true });
    }

    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const existing = await db.query("SELECT id FROM customers WHERE email=$1", [email]);
    if (existing.rows.length === 0) {
      return NextResponse.json({ success: true });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    await db.query(
      "UPDATE customers SET reset_code=$1, reset_code_expires=NOW() + INTERVAL '15 minutes' WHERE email=$2",
      [resetCode, email]
    );

    try {
      await sendPasswordResetEmail({ toEmail: email, code: resetCode });
    } catch (mailErr: any) {
      console.error("Reset email failed:", mailErr.message);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Forgot password error:", error.message);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
