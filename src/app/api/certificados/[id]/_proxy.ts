import { buildApiUrl, env } from "@/lib/env";
import type { NextRequest } from "next/server";

function buildBackendCertificadoUrlFromEnv(
  id: string,
  type: "preview" | "pdf"
) {
  const hasApiPrefix = env.apiBaseUrl.replace(/\/$/, "").endsWith("/api");
  const endpoint = `${hasApiPrefix ? "" : "api/"}${env.apiVersion}/cursos/certificados/${id}/${type}`;
  return buildApiUrl(endpoint);
}

function buildBackendCertificadoUrlFromOrigin(
  req: NextRequest,
  id: string,
  type: "preview" | "pdf"
) {
  // Fallback usando rewrite do frontend.
  return `${req.nextUrl.origin}/api/v1/cursos/certificados/${id}/${type}`;
}

function buildForwardHeaders(req: NextRequest, type: "preview" | "pdf") {
  const headers = new Headers();
  const authHeader = req.headers.get("authorization");
  const cookieHeader = req.headers.get("cookie");
  const token =
    req.cookies.get("token")?.value ||
    req.cookies.get("access_token")?.value ||
    null;

  // Preserva autenticação baseada em cookie quando o backend usa sessão/cookies.
  if (cookieHeader) {
    headers.set("Cookie", cookieHeader);
  }

  if (authHeader) {
    headers.set("Authorization", authHeader);
  } else if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  headers.set("Accept", type === "preview" ? "text/html" : "application/pdf");
  return headers;
}

function toGenericError(status: number) {
  if (status === 401) {
    return Response.json({ error: "Não autenticado." }, { status, headers: { "Cache-Control": "no-store" } });
  }

  if (status === 403) {
    return Response.json({ error: "Sem permissão para acessar este certificado." }, { status, headers: { "Cache-Control": "no-store" } });
  }

  if (status === 404) {
    return Response.json({ error: "Certificado não encontrado." }, { status, headers: { "Cache-Control": "no-store" } });
  }

  return Response.json({ error: "Não foi possível processar a solicitação." }, { status: 502, headers: { "Cache-Control": "no-store" } });
}

export async function proxyCertificadoAsset(
  req: NextRequest,
  id: string,
  type: "preview" | "pdf"
) {
  const urlFromEnv = buildBackendCertificadoUrlFromEnv(id, type);
  const urlFromOrigin = buildBackendCertificadoUrlFromOrigin(req, id, type);
  const targetUrls = Array.from(new Set([urlFromEnv, urlFromOrigin]));
  const headers = buildForwardHeaders(req, type);
  let lastStatus = 503;

  for (const targetUrl of targetUrls) {
    try {
      const upstream = await fetch(targetUrl, {
        method: "GET",
        headers,
        cache: "no-store",
      });

      if (!upstream.ok) {
        lastStatus = upstream.status;

        // 404/5xx pode indicar endpoint indisponível na origem atual:
        // tentamos a próxima URL candidata.
        if (upstream.status === 404 || upstream.status >= 500) {
          continue;
        }

        return toGenericError(upstream.status);
      }

      const responseHeaders = new Headers();
      responseHeaders.set("Cache-Control", "no-store");
      responseHeaders.set(
        "Content-Type",
        upstream.headers.get("content-type") ||
          (type === "preview" ? "text/html; charset=utf-8" : "application/pdf")
      );

      const contentDisposition = upstream.headers.get("content-disposition");
      if (contentDisposition) {
        responseHeaders.set("Content-Disposition", contentDisposition);
      }

      return new Response(upstream.body, {
        status: 200,
        headers: responseHeaders,
      });
    } catch {
      lastStatus = 503;
      continue;
    }
  }

  return toGenericError(lastStatus);
}
