import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const raw = req.nextUrl.searchParams.get("path") || "";
    const safe = raw.replace(/\.+/g, "").replace(/^\/+/g, "");

    const uploadDir = path.join(process.cwd(), "public", "images", "uploads", safe);
    fs.mkdirSync(uploadDir, { recursive: true });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = unique + path.extname(file.name);
    const filepath = path.join(uploadDir, filename);
    fs.writeFileSync(filepath, buffer);

    const relative = `/images/uploads${safe ? "/" + safe : ""}/${filename}`;
    return NextResponse.json({ url: relative });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("file") || "";
  const safe = raw.replace(/^\/+/g, "");
  if (!safe) {
    return NextResponse.json({ error: "File path is required" }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), "public", safe);
  try {
    fs.unlinkSync(filePath);
    return new Response(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
