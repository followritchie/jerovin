import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");
    const orderId = searchParams.get("id");

    if (orderId) {
      const result = await db.query(
        `SELECT o.*, 
        json_agg(json_build_object(
          'id', oi.id, 'product_id', oi.product_id, 'quantity', oi.quantity,
          'price_inr', oi.price_inr, 'custom_message', oi.custom_message,
          'name', p.name
        )) as items
        FROM orders o
        LEFT JOIN order_items oi ON oi.order_id = o.id
        LEFT JOIN products p ON p.id = oi.product_id
        WHERE o.id = $1 GROUP BY o.id`,
        [orderId]
      );
      return NextResponse.json(result.rows[0] || null);
    }

    if (customerId) {
      const result = await db.query(
        "SELECT * FROM orders WHERE customer_id=$1 ORDER BY created_at DESC",
        [customerId]
      );
      return NextResponse.json(result.rows);
    }

    const result = await db.query(
      "SELECT o.*, c.name as customer_name, c.email as customer_email FROM orders o LEFT JOIN customers c ON c.id = o.customer_id ORDER BY o.created_at DESC"
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerId, items, shippingAddress, subtotal, shipping, tax, total, currency, currencyRate, paymentMethod } = body;

    const orderNumber = "JRV" + Date.now();

    const orderResult = await db.query(
      `INSERT INTO orders (order_number, customer_id, status, subtotal_inr, shipping_inr, tax_inr, total_inr, currency, currency_rate, payment_method, payment_status, shipping_address, created_at)
      VALUES ($1,$2,'pending',$3,$4,$5,$6,$7,$8,$9,'pending',$10,NOW()) RETURNING id`,
      [orderNumber, customerId || null, subtotal, shipping, tax, total, currency || "INR", currencyRate || 1, paymentMethod || "online", JSON.stringify(shippingAddress)]
    );

    const orderId = orderResult.rows[0].id;

    for (const item of items) {
      await db.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price_inr, custom_color, custom_size, custom_message, reference_image_url)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [orderId, item.productId, item.quantity, item.price, item.customColor || null, item.customSize || null, item.customMessage || null, item.referenceImageUrl || null]
      );
    }

    return NextResponse.json({ success: true, orderId, orderNumber });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { orderId, status, trackingNumber, courier } = await req.json();
    await db.query(
      "UPDATE orders SET status=$1, tracking_number=$2, courier=$3, updated_at=NOW() WHERE id=$4",
      [status, trackingNumber || null, courier || null, orderId]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
