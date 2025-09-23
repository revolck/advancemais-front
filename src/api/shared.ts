import { apiConfig } from "@/lib/env";

const ACCEPT_HEADERS = Object.freeze({
  Accept: apiConfig.headers.Accept,
});

const PUBLIC_HEADERS = Object.freeze({
  ...apiConfig.headers,
});

type HeaderValue = HeadersInit | undefined;

type QueryPrimitive = string | number | boolean;

type QueryValue = QueryPrimitive | QueryPrimitive[] | null | undefined;

function toRecord(input: HeaderValue): Record<string, string> | null {
  if (!input) {
    return null;
  }

  if (input instanceof Headers) {
    return Object.fromEntries(input.entries());
  }

  if (Array.isArray(input)) {
    const result = new Headers();
    input.forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        result.set(key, String(value));
      }
    });
    return Object.fromEntries(result.entries());
  }

  const entries: [string, string][] = [];
  Object.entries(input).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      entries.push([key, String(value)]);
    }
  });
  return Object.fromEntries(entries);
}

function mergeRecords(
  ...headers: Array<Record<string, string> | null>
): Record<string, string> {
  const merged = new Headers();

  headers.forEach((record) => {
    if (!record) return;
    Object.entries(record).forEach(([key, value]) => {
      merged.set(key, value);
    });
  });

  return Object.fromEntries(merged.entries());
}

function buildAuthHeader(token?: string): Record<string, string> | null {
  const authToken = token ?? readBrowserToken();
  if (!authToken) {
    return null;
  }

  return { Authorization: `Bearer ${authToken}` };
}

export function readBrowserToken(cookieName = "token"): string | undefined {
  if (typeof document === "undefined") {
    return undefined;
  }

  const rawCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${cookieName}=`));

  return rawCookie ? rawCookie.split("=")[1] : undefined;
}

export function mergeHeaders(
  ...headers: HeaderValue[]
): Record<string, string> {
  const records = headers.map(toRecord);
  return mergeRecords(...records);
}

export function publicHeaders(
  extra?: HeadersInit,
): Record<string, string> {
  return mergeHeaders(PUBLIC_HEADERS, extra);
}

export function acceptHeaders(
  extra?: HeadersInit,
): Record<string, string> {
  return mergeHeaders(ACCEPT_HEADERS, extra);
}

export function authHeaders(
  token?: string,
  extra?: HeadersInit,
): Record<string, string> {
  return mergeHeaders(ACCEPT_HEADERS, buildAuthHeader(token) ?? undefined, extra);
}

export function authJsonHeaders(
  token?: string,
  extra?: HeadersInit,
): Record<string, string> {
  return mergeHeaders(
    PUBLIC_HEADERS,
    buildAuthHeader(token) ?? undefined,
    extra,
  );
}

export function buildQueryString(
  params?: Record<string, QueryValue>,
): string {
  if (!params) {
    return "";
  }

  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null) {
          query.append(key, String(item));
        }
      });
      return;
    }

    query.set(key, String(value));
  });

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

export const apiHeaders = {
  accept: () => ({ ...ACCEPT_HEADERS }),
  json: () => ({ ...PUBLIC_HEADERS }),
};

export type { QueryValue };
