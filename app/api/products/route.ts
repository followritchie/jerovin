import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";

export async function GET() {
  try {
    const result = await db.query(
      `SELECT id, name, description, price_inr as "priceINR", 
      category_id, is_custom, is_active, stock, seo_title, seo_description,
      created_at FROM products ORDER BY created_at DESC`
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const priceINR = parseFloat(formData.get("priceINR") as string);
    const categoryId = formData.get("categoryId") as string;
    const isCustom = formData.get("isCustom") === "true";
    const seoTitle = formData.get("seoTitle") as string;
    const seoDescription = formData.get("seoDescription") as string;
    const imageUrl = formData.get("imageUrl") as string;
    const id = formData.get("id") as string | null;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now();

    if (!name || !description || !priceINR) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (id) {
      await db.query(
        `UPDATE products SET name=$1, description=$2, price_inr=$3, 
        seo_title=$4, seo_description=$5, updated_at=NOW() WHERE id=$6`,
        [name, description, priceINR, seoTitle, seoDescription, id]
      );
      return NextResponse.json({ success: true, id });
    } else {
      const result = await db.query(
        `INSERT INTO products (name, slug, description, price_inr, category_id, 
        is_custom, seo_title, seo_description, is_active, is_approved, stock, created_at) 
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true,true,0,NOW()) RETURNING id`,
        [name, slug, description, priceINR, categoryId || null, isCustom, seoTitle || null, seoDescription || null]
      );
      const productId = result.rows[0].id;
      if (imageUrl) {
        await db.query(
          `INSERT INTO product_media (product_id, url, type, sort_order) VALUES ($1,$2,'image',0)`,
          [productId, imageUrl]
        );
      }
      return NextResponse.json({ success: true, id: productId });
    }
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json({ error: "Failed to save product" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    await db.query("DELETE FROM products WHERE id = $1", [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
