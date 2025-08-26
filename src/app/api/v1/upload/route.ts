import { NextRequest, NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { serverEnv } from "@/lib/env";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const rawPath = req.nextUrl.searchParams.get("path") || "";
    const safePath = rawPath.replace(/\.+/g, "").replace(/^\/+/g, "");
    const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
    const unique = `${Date.now()}-${safeName}`;
    const key = safePath ? `${safePath}/${unique}` : unique;

    const blob = await put(key, file, {
      access: "public",
      token: serverEnv.blobToken,
    });

    return NextResponse.json({ url: blob.url });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("file");
  if (!url) {
    return NextResponse.json({ error: "File path is required" }, { status: 400 });
  }

  try {
    await del(url, {
      token: serverEnv.blobToken,
    });
    return new Response(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}

