import { NextRequest, NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { serverEnv, env } from "@/lib/env";

export const runtime = "nodejs";

const COURSE_FILE_MAX_SIZE = 5 * 1024 * 1024;
const COURSE_ALLOWED_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "csv",
  "ppt",
  "pptx",
  "odt",
  "ods",
  "odp",
  "txt",
]);

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
    const isRestrictedCourseUpload =
      safePath.startsWith("cursos/comentarios/") ||
      safePath.startsWith("cursos/atividades/");
    const extension = file.name.split(".").pop()?.toLowerCase() || "";

    if (isRestrictedCourseUpload && file.size > COURSE_FILE_MAX_SIZE) {
      return NextResponse.json(
        { error: "O arquivo ultrapassa o limite permitido" },
        { status: 413 },
      );
    }

    if (isRestrictedCourseUpload && !COURSE_ALLOWED_EXTENSIONS.has(extension)) {
      return NextResponse.json(
        { error: "Tipo de arquivo não permitido" },
        { status: 415 },
      );
    }
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
    return NextResponse.json(
      { error: "File path is required" },
      { status: 400 },
    );
  }

  try {
    // Verifica se a URL é do Vercel Blob Storage
    if (
      !url.includes("blob.vercel-storage.com") &&
      !url.includes("public.blob.vercel-storage.com")
    ) {
      // URL externa (ex: via.placeholder.com) - não precisa deletar
      if (env.isDevelopment) {
        console.log("/upload DELETE: URL externa ignorada:", url);
      }
      return new Response(null, { status: 204 });
    }

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
