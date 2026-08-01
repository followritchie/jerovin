import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";

const CATEGORIES = ["women-sarees-designer","women-sarees-uppada","women-sarees-kanjivaram","women-lehengas","women-blouses","women-kurta-sets","men-sherwanis","men-kurtas","men-blazers","men-indo-western","kids-boys","kids-girls","jewellery-rings","jewellery-earrings","jewellery-pendants","jewellery-clips","footwear","gifts","snacks","handicrafts"];

const NAMES: Record<string,string[]> = {
  "women-sarees-designer":["Floral Designer Saree","Embroidered Silk Designer Saree","Net Designer Saree","Georgette Designer Saree","Banarasi Designer Saree","Bridal Designer Saree","Party Wear Designer Saree","Printed Designer Saree","Sequin Designer Saree","Zari Designer Saree"],
  "women-sarees-uppada":["Pure Uppada Silk Saree","Uppada Jamdani Saree","Uppada Tissue Saree","Gold Uppada Saree","Uppada Cotton Saree","Uppada Katan Saree","Uppada Pattu Saree","Uppada Checks Saree","Uppada Border Saree","Uppada Bridal Saree"],
  "women-sarees-kanjivaram":["Pure Kanjivaram Silk Saree","Bridal Kanjivaram Saree","Gold Zari Kanjivaram","Temple Border Kanjivaram","Contrast Pallu Kanjivaram","Checks Kanjivaram Saree","Peacock Kanjivaram Saree","Red Kanjivaram Saree","Green Kanjivaram Saree","Blue Kanjivaram Saree"],
  "women-lehengas":["Bridal Lehenga Choli","Embroidered Lehenga Set","Net Lehenga Choli","Silk Lehenga Set","Designer Lehenga","Floral Lehenga Choli","Mirror Work Lehenga","Georgette Lehenga","Party Wear Lehenga","Wedding Lehenga Set"],
  "women-blouses":["Aari Work Blouse","Embroidered Silk Blouse","Mirror Work Blouse","Zardosi Blouse","Designer Bridal Blouse","Maggam Work Blouse","Patch Work Blouse","Net Blouse Design","Back Neck Blouse","Sequin Blouse"],
  "women-kurta-sets":["Cotton Kurta Set","Silk Kurta Palazzo Set","Printed Kurta Set","Embroidered Kurta Set","Anarkali Kurta Set","Straight Kurta Set","A-Line Kurta Set","Georgette Kurta Set","Chanderi Kurta Set","Festive Kurta Set"],
  "men-sherwanis":["Bridal Sherwani","Jodhpuri Sherwani","Silk Sherwani","Embroidered Sherwani","Bandhgala Sherwani","Velvet Sherwani","Indo Western Sherwani","Cream Sherwani","Gold Sherwani","Royal Blue Sherwani"],
  "men-kurtas":["Cotton Kurta","Silk Kurta","Linen Kurta","Festive Kurta","Nehru Jacket Set","Embroidered Kurta","Printed Kurta","Angrakha Kurta","Mandarin Collar Kurta","Kurta Churidar Set"],
  "men-blazers":["Jodhpuri Blazer","Bandhgala Blazer","Silk Blazer","Velvet Blazer","Nehru Collar Blazer","Festive Blazer","Embroidered Blazer","Printed Blazer","Linen Blazer","Classic Indian Blazer"],
  "men-indo-western":["Indo Western Suit","Dhoti Pants Set","Fusion Kurta Jacket","Indo Western Sherwani","Nehru Jacket Kurta","Asymmetric Kurta","Draped Dhoti Set","Kurta Waistcoat Set","Patiala Dhoti Set","Layered Fusion Set"],
  "kids-boys":["Boys Kurta Set","Kids Sherwani","Boys Dhoti Kurta","Kids Bandhgala","Boys Nehru Jacket","Kids Festive Kurta","Boys Indo Western","Kids Embroidered Kurta","Boys Cotton Kurta","Kids Designer Set"],
  "kids-girls":["Girls Lehenga Choli","Kids Anarkali","Girls Salwar Suit","Kids Silk Frock","Girls Ghagra Choli","Kids Festive Dress","Girls Embroidered Kurta","Kids Party Wear","Girls Cotton Dress","Kids Designer Lehenga"],
  "jewellery-rings":["Gold Plated Ring","Kundan Ring","Meenakari Ring","Stone Studded Ring","Temple Ring","Oxidised Ring","Pearl Ring","CZ Diamond Ring","Adjustable Ring","Bridal Ring Set"],
  "jewellery-earrings":["Jhumka Earrings","Chandbali Earrings","Stud Earrings","Drop Earrings","Hoop Earrings","Kundan Earrings","Temple Earrings","Pearl Earrings","Oxidised Earrings","Bridal Earrings"],
  "jewellery-pendants":["Gold Plated Pendant","Kundan Pendant","Temple Pendant","Stone Pendant","Pearl Pendant","Meenakari Pendant","Ganesh Pendant","Om Pendant","Floral Pendant","Bridal Pendant"],
  "jewellery-clips":["Hair Clip Set","Saree Pin Set","Dupatta Clip","Bridal Hair Clip","Flower Hair Clip","Pearl Hair Clip","Temple Clip","Oxidised Clip","Kundan Clip","Juda Pin Set"],
  "footwear":["Kolhapuri Chappal","Embroidered Jutti","Bridal Heels","Mojari Shoes","Block Heels","Ethnic Sandals","Beaded Sandals","Mirror Work Sandals","Festive Flats","Punjabi Jutti"],
  "gifts":["Custom Name Plate","Personalised Photo Frame","Custom Cushion","Engraved Keychain","Custom Mug","Personalised Calendar","Custom Tote Bag","Engraved Jewellery Box","Custom Wall Art","Personalised Gift Hamper"],
  "snacks":["Khakhra Pack","Chakli Mix","Murukku Pack","Mixture Snack","Mathri Pack","Namkeen Mix","Bhakarwadi","Chivda Pack","Sev Mamra","Farsan Pack"],
  "handicrafts":["Madhubani Painting","Warli Art Frame","Blue Pottery Vase","Dokra Metal Art","Pattachitra Art","Kondapalli Toy","Channapatna Toy","Dhokra Figurine","Brass Idol","Wooden Wall Hanging"],
};

export async function GET(req: NextRequest) {
  const force = new URL(req.url).searchParams.get("force") === "true";
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    let total = 0;

    const mediaRes = await db.query("SELECT url,type FROM media_library ORDER BY RANDOM()");
    const allMedia = mediaRes.rows;
    const images = allMedia.filter((r:any) => r.type === "image").map((r:any) => r.url);
    const videos = allMedia.filter((r:any) => r.type === "video").map((r:any) => r.url);
    const allUrls = [...images, ...videos];

    if (allUrls.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "No media found in library. Upload images first." }, { status: 400 });
    }

    for (const cat of CATEGORIES) {
      const existing = await client.query("SELECT COUNT(*) as cnt FROM products WHERE category_id=$1", [cat]);
      const existingCount = parseInt(existing.rows[0].cnt);
      const needed = force ? 10 : Math.max(0, 10 - existingCount);
      if (needed === 0) continue;

      const names = NAMES[cat] || [`${cat} Product`];
      for (let i = 0; i < needed; i++) {
        const name = names[i % names.length] + (existingCount + i > 0 && force ? ` v${existingCount + i + 1}` : "");
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now() + "-" + Math.random().toString(36).slice(2, 5);
        const price = Math.floor(Math.random() * 8000) + 999;
        const comparePrice = Math.floor(price * (1.2 + Math.random() * 0.5));
        const isCustom = cat === "women-blouses" || cat === "gifts";

        const ins = await client.query(
          `INSERT INTO products (name,slug,description,price_inr,compare_price_inr,category_id,brand,stock,is_custom,tags,is_active,is_approved,created_at)
           VALUES ($1,$2,$3,$4,$5,$6,'Jerovin',10,$7,$8,true,true,NOW()) RETURNING id`,
          [name, slug, `${name} — premium handcrafted Indian fashion available exclusively at Jerovin. Perfect for weddings, festivals and special occasions.`,
           price, comparePrice, cat, isCustom, `${cat.replace(/-/g," ")}, indian fashion, handcrafted, jerovin`]
        );
        const pid = ins.rows[0].id;

        // Assign random media from library — give each product 3 random images
        const shuffled = [...allUrls].sort(() => Math.random() - 0.5).slice(0, 3);
        for (let j = 0; j < shuffled.length; j++) {
          const url = shuffled[j];
          const type = url.match(/\.(mp4|mov|webm|avif)/i) ? "video" : "image";
          await client.query(
            "INSERT INTO product_media (product_id,url,type,sort_order,created_at) VALUES ($1,$2,$3,$4,NOW())",
            [pid, url, type, j]
          );
        }
        total++;
      }
    }

    await client.query("COMMIT");
    return NextResponse.json({ success: true, created: total, message: `Created ${total} products using your uploaded media` });
  } catch (e: any) {
    await client.query("ROLLBACK");
    return NextResponse.json({ error: e.message }, { status: 500 });
  } finally {
    client.release();
  }
}
