import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
export async function GET(req: NextRequest) {
  try {
    const status = new URL(req.url).searchParams.get("status")||"draft";
    const r = await db.query(`SELECT * FROM product_drafts WHERE status=$1 ORDER BY created_at DESC`,[status]);
    return NextResponse.json(r.rows);
  } catch { return NextResponse.json([]); }
}
export async function POST(req: NextRequest) {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const b = await req.json();
    if (!b.name||!b.priceINR) return NextResponse.json({error:"Name and price required"},{status:400});
    const imageUrls = Array.isArray(b.imageUrls) ? b.imageUrls : [];
    const r = await client.query(
      `INSERT INTO product_drafts (name,description,price_inr,compare_price_inr,category_id,brand,sku,stock,shipping_type,india_shipping,international_shipping,is_custom,seo_title,seo_description,tags,image_urls,status,created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16::text[],$17,NOW()) RETURNING id`,
      [b.name,b.description||"",b.priceINR,b.comparePriceINR||null,b.categoryId||null,
       b.brand||"Jerovin",b.sku||null,b.stock||0,b.shippingType||"free",
       b.indiaShipping||0,b.internationalShipping||2800,b.isCustom||false,
       b.seoTitle||null,b.seoDescription||null,b.tags||null,
       imageUrls,b.status||"draft"]
    );
    await client.query("COMMIT");
    return NextResponse.json({success:true,id:r.rows[0].id});
  } catch(e:any){ await client.query("ROLLBACK"); return NextResponse.json({error:e.message},{status:500}); }
  finally { client.release(); }
}
export async function PATCH(req: NextRequest) {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const b = await req.json();
    const draftIds = b.ids||[b.id];
    if (b.status==="published") {
      let published=0;
      for (const did of draftIds) {
        const dr = await client.query("SELECT * FROM product_drafts WHERE id=$1",[did]);
        if (!dr.rows[0]) continue;
        const d=dr.rows[0];
        const urls:string[] = Array.isArray(d.image_urls) ? d.image_urls : [];
        const slug=d.name.toLowerCase().replace(/[^a-z0-9]+/g,"-")+"-"+Date.now();
        const ins=await client.query(
          `INSERT INTO products (name,slug,description,price_inr,compare_price_inr,category_id,brand,sku,stock,is_custom,seo_title,seo_description,tags,is_active,is_approved,created_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,true,true,NOW()) RETURNING id`,
          [d.name,slug,d.description,d.price_inr,d.compare_price_inr,d.category_id,
           d.brand||"Jerovin",d.sku,d.stock||0,d.is_custom||false,
           d.seo_title,d.seo_description,d.tags]
        );
        const pid=ins.rows[0].id;
        for (let i=0;i<urls.length;i++) {
          const url=urls[i];
          const type=url.match(/\.(mp4|mov|webm)(\?|$)/i)?"video":"image";
          await client.query(
            "INSERT INTO product_media (product_id,url,type,sort_order,created_at) VALUES ($1,$2,$3,$4,NOW())",
            [pid,url,type,i]
          );
        }
        await client.query("UPDATE product_drafts SET status='published' WHERE id=$1",[did]);
        published++;
      }
      await client.query("COMMIT");
      return NextResponse.json({success:true,published});
    }
    await client.query("UPDATE product_drafts SET status=$1 WHERE id=$2",[b.status,b.id]);
    await client.query("COMMIT");
    return NextResponse.json({success:true});
  } catch(e:any){ await client.query("ROLLBACK"); return NextResponse.json({error:e.message},{status:500}); }
  finally { client.release(); }
}
export async function DELETE(req: NextRequest) {
  try {
    const sp=new URL(req.url).searchParams;
    const ids=sp.get("ids"); const id=sp.get("id");
    if (ids) { for (const did of ids.split(",").map(Number).filter(Boolean)) await db.query("DELETE FROM product_drafts WHERE id=$1",[did]); return NextResponse.json({success:true}); }
    if (!id) return NextResponse.json({error:"Missing ID"},{status:400});
    await db.query("DELETE FROM product_drafts WHERE id=$1",[id]);
    return NextResponse.json({success:true});
  } catch(e:any){ return NextResponse.json({error:e.message},{status:500}); }
}
