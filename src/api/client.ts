import { buildApiUrl, env, ApiFallback } from "@/lib/env";

interface FetchOptions<T> {
  /** Optional RequestInit passed to fetch */
  init?: RequestInit;
  /** Mock data returned when fallback mode is `mock` */
  mockData?: T;
  /** Override global fallback strategy */
  fallback?: ApiFallback;
}

/**
 * Wrapper around `fetch` that applies global fallbacks when the API is unavailable.
 * - `mock`: returns the provided `mockData`.
 * - `skeleton`/`loading`: rethrows the error so the caller can render skeleton or loader.
 */
export async function apiFetch<T = unknown>(
  endpoint: string,
  { init, mockData, fallback = env.apiFallback }: FetchOptions<T> = {}
): Promise<T> {
  const url = endpoint.startsWith("http") ? endpoint : buildApiUrl(endpoint);

  try {
    const res = await fetch(url, { cache: "no-store", ...init });
    if (!res.ok) {
      throw new Error(`API responded with ${res.status}`);
    }
    return (await res.json()) as T;
  } catch (err) {
    if (fallback === "mock" && mockData) {
      return mockData;
    }
    // skeleton or loading: propagate error so UI decides what to render
    throw err;
  }
}
