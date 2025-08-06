import { buildApiUrl, env } from "@/lib/env";
import type { NextRequest } from "next/server";

async function proxy(req: NextRequest, context: any) {
  const { service, path = [] } = context.params as {
    service: string;
    path?: string[];
  };
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
    return new Response(res.body, { status: res.status, headers: res.headers });
  } catch {
    return Response.json(
      { error: "Service unavailable", service, path },
      { status: 503 }
    );
  }
}

export async function GET(req: NextRequest, context: any) {
  return proxy(req, context);
}

export { GET as POST, GET as PUT, GET as PATCH, GET as DELETE };
