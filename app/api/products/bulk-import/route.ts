import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";

export async function POST(req: NextRequest) {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const body = await req.json();
    const { rows, timezone } = body;
    if (!Array.isArray(rows) || !rows.length) return NextResponse.json({ error: "No rows" }, { status: 400 });
    const tz = timezone || "UTC";
    const now = new Date();
    const uploadedAtLocal = now.toLocaleString("en-US", { timeZone: tz, dateStyle: "medium", timeStyle: "short" }) + ` (${tz})`;
    const uploadedAtEST = now.toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "medium", timeStyle: "short" }) + " EST";
    let ok = 0, fail = 0;
    const errors: string[] = [];
    for (const row of rows) {
      const name = (row["Product Name (REQUIRED)"] || "").toString().trim();
      const price = parseFloat(row["Selling Price INR (REQUIRED)"] || 0);
      if (!name || !price) { fail++; errors.push(`Skipped row: missing name or price`); continue; }
      try {
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6);
        const categoryId = (row["Category ID (REQUIRED)"] || "").toString().trim() || null;
        const comparePrice = parseFloat(row["Original Price INR"] || 0) || null;
        const stock = parseInt(row["Stock Quantity"] || 0) || 0;
        const isCustom = (row["Is Custom (yes/no)"] || "").toString().toLowerCase() === "yes";
        const tags = (row["Tags"] || "").toString().trim() || null;
        const seoTitle = (row["SEO Title (max 60)"] || "").toString().trim() || null;
        const seoDescription = (row["SEO Description (max 160)"] || "").toString().trim() || null;
        const description = (row["Description (REQUIRED)"] || "").toString().trim() || "";
        const brand = (row["Brand"] || "Jerovin").toString().trim();
        const sku = (row["SKU"] || "").toString().trim() || null;
        const imgStr = (row["Image URLs (comma separated)"] || "").toString().trim();
        const imageUrls = imgStr ? imgStr.split(",").map((s: string) => s.trim()).filter(Boolean) : [];
        const ins = await client.query(
          `INSERT INTO products (name,slug,description,price_inr,compare_price_inr,category_id,brand,sku,stock,is_custom,seo_title,seo_description,tags,is_active,is_approved,uploaded_timezone,uploaded_at_local,uploaded_at_est,created_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,true,true,$14,$15,$16,NOW()) RETURNING id`,
          [name, slug, description, price, comparePrice, categoryId, brand, sku, stock, isCustom, seoTitle, seoDescription, tags, tz, uploadedAtLocal, uploadedAtEST]
        );
        const productId = ins.rows[0].id;
        for (let i = 0; i < imageUrls.length; i++) {
          const url = imageUrls[i];
          const type = url.match(/\.(mp4|mov|webm)(\?|$)/i) ? "video" : "image";
          await client.query("INSERT INTO product_media (product_id,url,type,sort_order,created_at) VALUES ($1,$2,$3,$4,NOW())", [productId, url, type, i]);
        }
        ok++;
      } catch (e: any) { fail++; errors.push(`"${name}": ${e.message}`); }
    }
    await client.query("COMMIT");
    return NextResponse.json({ success: true, imported: ok, failed: fail, errors });
  } catch (e: any) {
    await client.query("ROLLBACK");
    return NextResponse.json({ error: e.message }, { status: 500 });
  } finally { client.release(); }
}
