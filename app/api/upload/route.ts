import { NextRequest, NextResponse } from "next/server";
import ImageKit from "imagekit";

const imagekit = new ImageKit({
  urlEndpoint: "https://ik.imagekit.io/jerovin",
  publicKey: "public_kcQnpwQy6vpG/dyGG+JdVaFuYTY=",
  privateKey: "private_zBHInQKJwQX9lhGdvgcnON29kxE=",
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const fileName = formData.get("fileName") as string;
    const folder = formData.get("folder") as string || "products";

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");

    const result = await imagekit.upload({
      file: base64,
      fileName: fileName,
      folder: folder,
      useUniqueFileName: true,
      tags: ["jerovin", "product"],
    });

    return NextResponse.json({
      url: result.url,
      fileId: result.fileId,
      name: result.name,
      thumbnailUrl: result.thumbnailUrl,
    });
  } catch (error) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
