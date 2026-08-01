import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";

export async function GET(_req: NextRequest, context: any) {
  try {
    const { id } = await context.params;
    const r = await db.query(
      `SELECT p.id, p.name, p.description,
        p.price_inr as "priceINR",
        p.compare_price_inr as "comparePriceINR",
        p.category_id, p.sku, p.stock, p.tags,
        p.is_custom as "isCustom",
        p.seo_title as "seoTitle",
        p.seo_description as "seoDescription",
        p.created_at,
        COALESCE(
          json_agg(
            json_build_object('url', pm.url, 'type', pm.type)
            ORDER BY pm.sort_order
          ) FILTER (WHERE pm.id IS NOT NULL),
          '[]'::json
        ) as media
      FROM products p
      LEFT JOIN product_media pm ON pm.product_id = p.id
      WHERE p.id = $1
      GROUP BY p.id`,
      [id]
    );
    if (!r.rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(r.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(_req: NextRequest, context: any) {
  try {
    const { id } = await context.params;
    const body = await _req.json();
    const { status } = body;
    await db.query("UPDATE products SET is_active=$1, updated_at=NOW() WHERE id=$2", [status === "active", id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
