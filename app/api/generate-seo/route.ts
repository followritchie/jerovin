import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { productName, description, roughNotes, category } = await req.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;

    const prompt = `You are an expert ecommerce SEO specialist for Indian fashion products sold globally in USA, Canada, UK, Australia and India.

A seller has provided this rough information about their product:
Product Name: ${productName || "Indian fashion product"}
Category: ${category || "Indian fashion"}
Rough notes: ${roughNotes || description || "Authentic Indian handcrafted product"}

Generate professional, SEO-optimized product content. Return ONLY valid JSON with no extra text:
{
  "seoTitle": "max 60 chars, compelling, include product type and key benefit",
  "seoDescription": "max 160 chars, include material, occasion, shipping mention",
  "tags": ["8 to 10 highly searched keywords for Google and Amazon"],
  "productTitle": "professional clean product title",
  "productDescription": "3-4 sentence professional product description highlighting material, craftsmanship, occasion suitability, care instructions"
}`;

    if (!apiKey || apiKey === "your_anthropic_api_key_here") {
      return NextResponse.json({
        seoTitle: `${productName} | Authentic Indian Fashion | Jerovin`,
        seoDescription: `Shop ${productName} at Jerovin. Premium handcrafted Indian fashion. Free shipping India. Worldwide delivery in 5-7 days.`,
        tags: ["indian fashion", "handcrafted", productName?.toLowerCase() || "saree", "jerovin", "authentic", "indian wear", "ethnic fashion", "online shopping"],
        productTitle: productName,
        productDescription: `${productName} — a premium handcrafted Indian fashion piece available exclusively at Jerovin. Crafted by skilled artisans using traditional techniques. Perfect for weddings, festivals and special occasions. Free shipping within India. International delivery in 5-7 business days.`,
      });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 800,
        messages: [{ role: "user", content: prompt }]
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || "{}";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error("SEO error:", error.message);
    return NextResponse.json({
      seoTitle: "Authentic Indian Fashion | Jerovin",
      seoDescription: "Premium handcrafted Indian fashion. Shop at Jerovin. Free shipping India. Worldwide delivery.",
      tags: ["indian fashion", "handcrafted", "authentic", "jerovin", "ethnic wear"],
      productTitle: "",
      productDescription: "",
    });
  }
}
