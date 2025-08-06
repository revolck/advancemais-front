import { buildApiUrl, env } from "@/lib/env";

interface Params {
  params: {
    service: string;
    path?: string[];
  };
}

async function proxy(req: Request, { params }: Params) {
  const { service, path = [] } = params;
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

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE };
