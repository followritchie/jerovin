import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { amount, currency, receipt } = await req.json();
    const keyId = process.env.RAZORPAY_KEY_ID!;
    const keySecret = process.env.RAZORPAY_KEY_SECRET!;
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Math.round((amount || 100) * 100),
        currency: "INR",
        receipt: receipt || "jerovin_" + Date.now(),
      }),
    });

    const order = await res.json();
    if (order.error) {
      console.error("Razorpay error:", order.error);
      return NextResponse.json({ error: order.error.description }, { status: 400 });
    }

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: keyId,
    });
  } catch (error: any) {
    console.error("Razorpay route error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
