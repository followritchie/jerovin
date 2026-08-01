import { db } from "./db";
export interface Product {
  id: number; name: string; description: string; priceINR: number;
  comparePriceINR?: number | null; image?: string;
  media?: { url: string; type: string }[];
  category_id?: string; sku?: string; stock?: number; tags?: string;
  isCustom?: boolean; seoTitle?: string; seoDescription?: string; created_at?: string;
}
export async function getProduct(id: string): Promise<Product | null> {
  try {
    const r = await db.query(`SELECT p.id,p.name,p.description,p.price_inr as "priceINR",p.compare_price_inr as "comparePriceINR",p.category_id,p.sku,p.stock,p.tags,p.is_custom as "isCustom",p.seo_title as "seoTitle",p.seo_description as "seoDescription",p.created_at,COALESCE(json_agg(json_build_object('url',pm.url,'type',pm.type) ORDER BY pm.sort_order) FILTER (WHERE pm.id IS NOT NULL),'[]'::json) as media FROM products p LEFT JOIN product_media pm ON pm.product_id=p.id WHERE p.id=$1 GROUP BY p.id`,[id]);
    if (!r.rows[0]) return null;
    const row=r.rows[0]; const fi=row.media?.find((m:any)=>m.type==="image");
    return {...row,image:fi?.url||null};
  } catch(e){console.error(e);return null;}
}
export async function getAllProducts(): Promise<Product[]> {
  try {
    const r = await db.query(`SELECT p.id,p.name,p.description,p.price_inr as "priceINR",p.compare_price_inr as "comparePriceINR",p.category_id,p.sku,p.stock,p.tags,p.is_custom as "isCustom",p.seo_title as "seoTitle",p.seo_description as "seoDescription",p.created_at,COALESCE(json_agg(json_build_object('url',pm.url,'type',pm.type) ORDER BY pm.sort_order) FILTER (WHERE pm.id IS NOT NULL),'[]'::json) as media FROM products p LEFT JOIN product_media pm ON pm.product_id=p.id WHERE p.is_active=true GROUP BY p.id ORDER BY p.created_at DESC`);
    return r.rows.map((row:any)=>{const fi=row.media?.find((m:any)=>m.type==="image");return{...row,image:fi?.url||null};});
  } catch(e){console.error(e);return[];}
}
export async function getProductsByCategory(cat: string): Promise<Product[]> {
  try {
    const r = await db.query(`SELECT p.id,p.name,p.description,p.price_inr as "priceINR",p.compare_price_inr as "comparePriceINR",p.category_id,p.sku,p.stock,p.tags,p.is_custom as "isCustom",p.seo_title as "seoTitle",p.seo_description as "seoDescription",p.created_at,COALESCE(json_agg(json_build_object('url',pm.url,'type',pm.type) ORDER BY pm.sort_order) FILTER (WHERE pm.id IS NOT NULL),'[]'::json) as media FROM products p LEFT JOIN product_media pm ON pm.product_id=p.id WHERE p.is_active=true AND p.category_id ILIKE $1 GROUP BY p.id ORDER BY p.created_at DESC`,[`${cat}%`]);
    return r.rows.map((row:any)=>{const fi=row.media?.find((m:any)=>m.type==="image");return{...row,image:fi?.url||null};});
  } catch(e){console.error(e);return[];}
}
