import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";

export async function GET() {
  try {
    const r = await db.query(`SELECT id,url,name,type,size,category,uploaded_at as "uploadedAt",timezone,uploaded_at_est as "uploadedAtEST" FROM media_library ORDER BY uploaded_at DESC`);
    return NextResponse.json(r.rows);
  } catch { return NextResponse.json([]); }
}

export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    const r = await db.query(
      `INSERT INTO media_library (url,name,type,size,category,uploaded_at,timezone,uploaded_at_est) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
      [b.url, b.name||"", b.type||"image", b.size||"", b.category||"uncategorized", b.uploadedAt||new Date().toISOString(), b.timezone||"UTC", b.uploadedAtEST||""]
    );
    return NextResponse.json({ success: true, id: r.rows[0].id });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function DELETE(req: NextRequest) {
  try {
    const { ids } = await req.json();
    if (!ids?.length) return NextResponse.json({ error: "No IDs" }, { status: 400 });
    await db.query(`DELETE FROM media_library WHERE id = ANY($1::int[])`, [ids]);
    return NextResponse.json({ success: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
