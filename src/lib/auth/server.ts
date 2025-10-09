import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

export interface DashboardAuthContext {
  token: string;
  authHeaders: Record<string, string>;
  loginUrl: string;
}

interface ComposeLoginUrlParams {
  hostname?: string | null;
  protocol?: string | null;
  port?: string | null;
  redirectPath: string;
}

function sanitizeHostname(rawHostname: string | null | undefined): string {
  const fallback = "app.advancemais.com";
  if (!rawHostname || rawHostname.trim().length === 0) {
    return fallback;
  }

  return rawHostname
    .replace(/^https?:\/\//, "")
    .replace(/\/.*/, "")
    .trim();
}

function normalizeProtocol(
  rawProtocol: string | null | undefined,
  isLocalhost: boolean
): "http" | "https" {
  if (!rawProtocol || rawProtocol.trim().length === 0) {
    return isLocalhost ? "http" : "https";
  }

  const normalized = rawProtocol.replace(/:$/, "").toLowerCase();
  return normalized === "http" ? "http" : "https";
}

function extractHostInfo(hostHeader: string | null): {
  hostname: string;
  port: string | null;
} {
  const sanitized = sanitizeHostname(hostHeader);

  if (sanitized.includes(":")) {
    const [host, port] = sanitized.split(":");
    return { hostname: host, port: port || null };
  }

  return { hostname: sanitized, port: null };
}

export function composeDashboardLoginUrl({
  hostname,
  protocol,
  port,
  redirectPath,
}: ComposeLoginUrlParams): string {
  const sanitizedHost = sanitizeHostname(hostname ?? undefined);
  let derivedHost = sanitizedHost;
  let derivedPort = port ?? null;

  if (!derivedPort && sanitizedHost.includes(":")) {
    const [hostOnly, hostPort] = sanitizedHost.split(":");
    derivedHost = hostOnly || sanitizedHost;
    derivedPort = hostPort || null;
  }

  const isLocalhost =
    derivedHost === "localhost" || derivedHost === "127.0.0.1";
  const resolvedProtocol = normalizeProtocol(protocol, isLocalhost);
  const portSegment = derivedPort ? `:${derivedPort}` : "";
  const encodedRedirect = encodeURIComponent(redirectPath);

  const baseDomain = derivedHost
    .replace(/^www\./, "")
    .replace(/^app\./, "")
    .replace(/^auth\./, "");

  if (isLocalhost) {
    return `${resolvedProtocol}://${derivedHost}${portSegment}/auth/login?redirect=${encodedRedirect}`;
  }

  return `${resolvedProtocol}://auth.${baseDomain}${portSegment}/login?redirect=${encodedRedirect}`;
}

async function resolveLoginUrl(redirectPath: string): Promise<string> {
  const headerList = await headers();

  const xForwardedHost = headerList.get("x-forwarded-host");
  const host = headerList.get("host");
  const forwardedPort = headerList.get("x-forwarded-port");
  const forwardedProto = headerList.get("x-forwarded-proto");

  const { hostname, port } = extractHostInfo(xForwardedHost ?? host);

  return composeDashboardLoginUrl({
    hostname,
    protocol: forwardedProto ?? null,
    port: forwardedPort ?? port,
    redirectPath,
  });
}

export async function requireDashboardAuth(
  redirectPath: string
): Promise<DashboardAuthContext> {
  const loginUrl = await resolveLoginUrl(redirectPath);
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect(loginUrl);
  }

  return {
    token,
    loginUrl,
    authHeaders: {
      Authorization: `Bearer ${token}`,
    },
  };
}

export function handleDashboardApiError(
  error: unknown,
  loginUrl: string,
  context?: Record<string, unknown>
): never {
  const status = (error as { status?: number } | undefined)?.status;

  if (status === 401) {
    redirect(loginUrl);
  }

  if (status === 403) {
    redirect("/dashboard/unauthorized");
  }

  if (status === 404) {
    notFound();
  }

  console.error("Erro inesperado na API do dashboard:", {
    error,
    ...context,
  });

  if (error instanceof Error) {
    throw error;
  }

  throw new Error("Erro desconhecido ao acessar a API do dashboard");
}
