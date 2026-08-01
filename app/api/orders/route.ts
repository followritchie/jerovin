import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get("email");
    const phone = req.nextUrl.searchParams.get("phone");

    if (!email && !phone) {
      return NextResponse.json([], { status: 400 });
    }

    let query = `
      SELECT id, order_number, total_inr, shipping_inr, tax_inr, status,
             payment_method, payment_status, tracking_number, courier,
             shipping_address, created_at
      FROM orders
      WHERE 1=1
    `;
    const params: string[] = [];

    if (email) {
      params.push(email);
      query += ` AND (shipping_address::text ILIKE '%' || $${params.length} || '%')`;
    }
    if (phone) {
      params.push(phone);
      query += ` AND (shipping_address::text ILIKE '%' || $${params.length} || '%')`;
    }

    query += ` ORDER BY created_at DESC LIMIT 100`;

    const result = await db.query(query, params);
    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error("GET orders error:", error.message);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      items, shippingAddress, subtotal, shipping, tax, total,
      currency, currencyRate, paymentMethod
    } = body;

    if (!items || !shippingAddress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const orderNumber = "JRV" + Date.now() + Math.floor(Math.random() * 1000);

    const result = await db.query(
      `INSERT INTO orders (
        order_number, shipping_address, subtotal_inr, shipping_inr, tax_inr, total_inr,
        currency, currency_rate, payment_method, payment_status, status, created_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'pending','pending',NOW()) RETURNING id, order_number`,
      [
        orderNumber,
        JSON.stringify(shippingAddress),
        subtotal, shipping, tax, total,
        currency || "INR",
        currencyRate || 1,
        paymentMethod || "razorpay"
      ]
    );

    const orderId = result.rows[0].id;
    const orderNum = result.rows[0].order_number;

    if (items && items.length > 0) {
      for (const item of items) {
        try {
          await db.query(
            `INSERT INTO order_items (order_id, product_id, quantity, price_inr, created_at)
             VALUES ($1,$2,$3,$4,NOW())`,
            [orderId, item.productId, item.quantity, item.price]
          );
        } catch (itemErr: any) {
          console.error("Order item insert error:", itemErr.message);
        }
      }
    }

    return NextResponse.json({ success: true, orderId, orderNumber: orderNum });
  } catch (error: any) {
    console.error("POST orders error:", error.message);
    return NextResponse.json({ error: "Failed to create order", details: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { orderId, status, trackingNumber, courier, paymentId } = await req.json();
    if (!orderId) return NextResponse.json({ error: "Missing orderId" }, { status: 400 });

    await db.query(
      `UPDATE orders SET
        status = COALESCE($1, status),
        tracking_number = COALESCE($2, tracking_number),
        courier = COALESCE($3, courier),
        payment_id = COALESCE($4, payment_id),
        updated_at = NOW()
      WHERE id = $5`,
      [status || null, trackingNumber || null, courier || null, paymentId || null, orderId]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("PATCH orders error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
