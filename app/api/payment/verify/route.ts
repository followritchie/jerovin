import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/app/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId, testMode } = await req.json();

    // Test mode bypass for development
    if (testMode && process.env.NODE_ENV === "development") {
      await db.query(
        "UPDATE orders SET payment_status='paid', payment_id=$1, status='confirmed', updated_at=NOW() WHERE id=$2",
        ["test_payment_" + Date.now(), orderId]
      );
      return NextResponse.json({ success: true, paymentId: "test_mode" });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    await db.query(
      "UPDATE orders SET payment_status='paid', payment_id=$1, status='confirmed', updated_at=NOW() WHERE id=$2",
      [razorpay_payment_id, orderId]
    );

    return NextResponse.json({ success: true, paymentId: razorpay_payment_id });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 });
  }
}
