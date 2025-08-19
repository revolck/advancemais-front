import { buildApiUrl, env, ApiFallback } from "@/lib/env";

interface FetchOptions<T> {
  init?: RequestInit;
  mockData?: T;
  fallback?: ApiFallback;
  cache?: "no-cache" | "short" | "medium" | "long";
  retries?: number;
  timeout?: number;
}

// Cache em memória simples
const memoryCache = new Map<
  string,
  { data: any; timestamp: number; ttl: number }
>();

// Tempos de cache (em ms)
const CACHE_TTL = {
  short: 5 * 60 * 1000, // 5 minutos
  medium: 30 * 60 * 1000, // 30 minutos
  long: 24 * 60 * 60 * 1000, // 24 horas
};

/**
 * Cliente API otimizado com cache, retry automático e timeout
 */
export async function apiFetch<T = unknown>(
  endpoint: string,
  {
    init,
    mockData,
    fallback = env.apiFallback,
    cache = "short",
    retries = 3,
    timeout = 15000,
  }: FetchOptions<T> = {}
): Promise<T> {
  const url = endpoint.startsWith("http") ? endpoint : buildApiUrl(endpoint);
  const cacheKey = `${url}-${JSON.stringify(init)}`;

  // Verifica cache primeiro
  if (cache !== "no-cache") {
    const cached = getFromCache<T>(cacheKey);
    if (cached) {
      console.log(`📋 Cache hit: ${endpoint}`);
      return cached;
    }
  }

  // Executa request com retry e timeout
  let lastError: Error;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🌐 API Request [${attempt}/${retries}]: ${endpoint}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const res = await fetch(url, {
        cache: "no-store",
        signal: controller.signal,
        ...init,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        let errorMessage = `API responded with ${res.status}: ${res.statusText}`;

        try {
          const errorData = await res.json();
          if (errorData && typeof errorData === "object") {
            // many APIs retornam { message: "..." }
            errorMessage =
              (errorData as any).message || (errorData as any).error || errorMessage;
          }
        } catch {
          // tenta obter texto puro caso não seja JSON
          try {
            const text = await res.text();
            if (text) errorMessage = text;
          } catch {
            /* ignore */
          }
        }

        const errorObj = new Error(errorMessage);
        (errorObj as any).status = res.status;
        throw errorObj;
      }

      // Tenta determinar o tipo de conteúdo para parse adequado
      let data: T | undefined;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = (await res.json()) as T;
      } else if (res.status !== 204) {
        // Se houver conteúdo mas não for JSON, retorna texto puro
        data = (await res.text()) as unknown as T;
      }

      // Armazena no cache apenas se houver dados
      if (cache !== "no-cache" && data !== undefined) {
        setCache(cacheKey, data, CACHE_TTL[cache]);
      }

      console.log(`✅ API Success: ${endpoint}`);
      return data as T;
    } catch (error) {
      lastError = error as Error;
      console.warn(`⚠️ API Error [${attempt}/${retries}]:`, error);

      // Aguarda antes do próximo retry (backoff exponencial)
      if (attempt < retries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  // Se chegou aqui, todas as tentativas falharam
  console.error(`❌ API Failed após ${retries} tentativas:`, lastError!);

  // Tenta retornar dados em cache expirados como fallback
  const expiredCache = getFromCache<T>(cacheKey, true);
  if (expiredCache) {
    console.warn(`📋 Usando cache expirado: ${endpoint}`);
    return expiredCache;
  }

  // Aplica estratégia de fallback
  if (fallback === "mock" && mockData) {
    console.warn(`🎭 Usando mock data: ${endpoint}`);
    return mockData;
  }

  // Re-throw error para que o componente possa mostrar skeleton/loading
  throw lastError!;
}

function getFromCache<T>(key: string, includeExpired = false): T | null {
  const cached = memoryCache.get(key);
  if (!cached) return null;

  const isExpired = Date.now() > cached.timestamp + cached.ttl;
  if (isExpired && !includeExpired) {
    memoryCache.delete(key);
    return null;
  }

  return cached.data as T;
}

function setCache(key: string, data: any, ttl: number): void {
  memoryCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  });

  // Limpa cache automaticamente (garbage collection)
  setTimeout(() => {
    if (memoryCache.has(key)) {
      const cached = memoryCache.get(key)!;
      if (Date.now() > cached.timestamp + cached.ttl) {
        memoryCache.delete(key);
      }
    }
  }, ttl + 1000);
}

// Limpa todo o cache
export function clearApiCache(): void {
  memoryCache.clear();
  console.log("🗑️ Cache da API limpo");
}
