import { NextRequest, NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { serverEnv, env } from "@/lib/env";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    if (!serverEnv.blobToken) {
      const msg = "Blob token não configurado";
      if (env.isDevelopment) console.error("/upload POST:", msg);
      return NextResponse.json({ error: msg }, { status: 500 });
    }
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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Upload failed";
    if (env.isDevelopment) console.error("/upload POST error:", message, err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("file");
  if (!url) {
    return NextResponse.json({ error: "File path is required" }, { status: 400 });
  }

  try {
    if (!serverEnv.blobToken) {
      const msg = "Blob token não configurado";
      if (env.isDevelopment) console.error("/upload DELETE:", msg);
      return NextResponse.json({ error: msg }, { status: 500 });
    }
    await del(url, { token: serverEnv.blobToken });
    return new Response(null, { status: 204 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Delete failed";
    if (env.isDevelopment) console.error("/upload DELETE error:", message, err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
