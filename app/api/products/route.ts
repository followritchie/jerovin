import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    let query = `
      SELECT p.id, p.name, p.description,
        p.price_inr as "priceINR", p.compare_price_inr as "comparePriceINR",
        p.category_id, p.sku, p.stock, p.tags,
        p.is_active, p.is_custom as "isCustom", p.seo_title as "seoTitle",
        p.seo_description as "seoDescription", p.created_at,
        p.uploaded_at_local, p.uploaded_at_est,
        COALESCE(json_agg(json_build_object('url',pm.url,'type',pm.type) ORDER BY pm.sort_order) FILTER (WHERE pm.id IS NOT NULL),'[]'::json) as media
      FROM products p LEFT JOIN product_media pm ON pm.product_id=p.id
    `;
    if (search) {
      const result = await db.query(query + " WHERE p.name ILIKE $1 OR p.description ILIKE $1 OR p.tags ILIKE $1 GROUP BY p.id ORDER BY p.created_at DESC", [`%${search}%`]);
      return NextResponse.json(result.rows);
    }
    const result = await db.query(query + " GROUP BY p.id ORDER BY p.created_at DESC");
    return NextResponse.json(result.rows);
  } catch (error: any) {
    return NextResponse.json([], { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const ids = searchParams.get("ids");
    if (ids) {
      const idArray = ids.split(",").map(Number).filter(Boolean);
      for (const pid of idArray) {
        await db.query("DELETE FROM product_media WHERE product_id=$1", [pid]);
        await db.query("DELETE FROM products WHERE id=$1", [pid]);
      }
      return NextResponse.json({ success: true });
    }
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    await db.query("DELETE FROM product_media WHERE product_id=$1", [id]);
    await db.query("DELETE FROM products WHERE id=$1", [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const formData = await req.formData();
    const name = (formData.get("name") as string)?.trim();
    const description = (formData.get("description") as string)||"";
    const priceINR = parseFloat(formData.get("priceINR") as string);
    const categoryId = (formData.get("categoryId") as string)||null;
    const isCustom = formData.get("isCustom")==="true";
    const seoTitle = (formData.get("seoTitle") as string)||null;
    const seoDescription = (formData.get("seoDescription") as string)||null;
    const stock = parseInt(formData.get("stock") as string)||0;
    const imageUrl = (formData.get("imageUrl") as string)||null;
    const tags = (formData.get("tags") as string)||null;
    const id = formData.get("id") as string|null;
    if (!name||isNaN(priceINR)) return NextResponse.json({ error: "Name and price required" }, { status: 400 });
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g,"-") + "-" + Date.now();
    if (id) {
      await client.query(`UPDATE products SET name=$1,description=$2,price_inr=$3,category_id=$4,is_custom=$5,seo_title=$6,seo_description=$7,stock=$8,tags=$9,updated_at=NOW() WHERE id=$10`,
        [name,description,priceINR,categoryId,isCustom,seoTitle,seoDescription,stock,tags,id]);
      await client.query("COMMIT");
      return NextResponse.json({ success: true, id });
    }
    const result = await client.query(
      `INSERT INTO products (name,slug,description,price_inr,category_id,is_custom,seo_title,seo_description,tags,is_active,is_approved,stock,created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,true,true,$10,NOW()) RETURNING id`,
      [name,slug,description,priceINR,categoryId,isCustom,seoTitle,seoDescription,tags,stock]
    );
    const productId = result.rows[0].id;
    if (imageUrl) await client.query("INSERT INTO product_media (product_id,url,type,sort_order,created_at) VALUES ($1,$2,'image',0,NOW())", [productId,imageUrl]);
    await client.query("COMMIT");
    return NextResponse.json({ success: true, id: productId });
  } catch (error: any) {
    await client.query("ROLLBACK");
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally { client.release(); }
}


export async function PATCH(req: NextRequest) {
  try {
    const { id, is_active } = await req.json();
    await db.query("UPDATE products SET is_active=$1, updated_at=NOW() WHERE id=$2", [is_active, id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}