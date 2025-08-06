import { buildApiUrl, env } from "@/lib/env";
import type { NextRequest } from "next/server";

interface RouteParams {
  service: string;
  path?: string[];
}

async function proxy(
  req: NextRequest,
  context: { params: Promise<RouteParams> }
) {
  const { service, path = [] } = await context.params;
  const hasApiPrefix = env.apiBaseUrl.replace(/\/$/, "").endsWith("/api");
  const endpoint = `${hasApiPrefix ? "" : "api/"}${env.apiVersion}/${service}${
    path.length ? "/" + path.join("/") : ""
  }`;
  const url = buildApiUrl(endpoint);

  try {
    const init: RequestInit = {
      method: req.method,
      headers: req.headers,
      cache: "no-store",
    };

    if (req.method !== "GET" && req.method !== "HEAD") {
      init.body = req.body;
      // @ts-expect-error duplex is required when using a readable stream as body in node-fetch
      init.duplex = "half";
    }

    const res = await fetch(url, init);

    const headers = new Headers(res.headers);
    headers.delete("content-encoding");
    headers.delete("content-length");

    return new Response(res.body, { status: res.status, headers });
  } catch {
    return Response.json(
      { error: "Service unavailable", service, path },
      { status: 503 }
    );
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<RouteParams> }
) {
  return proxy(req, context);
}

export { GET as POST, GET as PUT, GET as PATCH, GET as DELETE };
