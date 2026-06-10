import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { productName, description } = await req.json();

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 500,
        messages: [{
          role: "user",
          content: `Generate SEO content for this Indian fashion product. Return ONLY a JSON object with no markdown or explanation:
{"seoTitle": "max 60 chars title", "seoDescription": "max 160 chars description", "tags": ["tag1","tag2","tag3","tag4","tag5"]}

Product Name: ${productName}
Description: ${description}`
        }]
      }),
    });

    const data = await response.json();
    const text = data.content[0].text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(text);
    return NextResponse.json(parsed);
  } catch (error) {
    return NextResponse.json({
      seoTitle: "",
      seoDescription: "",
      tags: []
    }, { status: 500 });
  }
}
