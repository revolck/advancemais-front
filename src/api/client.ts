import { buildApiUrl, env, ApiFallback } from "@/lib/env";
import { logoutUser } from "@/lib/auth";

interface FetchOptions<T> {
  init?: RequestInit;
  mockData?: T;
  fallback?: ApiFallback;
  cache?: "no-cache" | "short" | "medium" | "long";
  retries?: number;
  timeout?: number;
  /**
   * Evita executar o fluxo de logout automático quando a API retorna 401.
   * Útil para rotas públicas como login, onde o redirect quebra a UX.
   */
  skipLogoutOn401?: boolean;
  /**
   * Silencia erros 404 (não loga como erro em desenvolvimento).
   * Útil para endpoints que podem não existir ou retornar 404 quando não há dados.
   */
  silence404?: boolean;
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
    skipLogoutOn401 = false,
    silence404 = false,
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
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (env.isDevelopment) {
        console.log(`🌐 API Request [${attempt}/${retries}]: ${endpoint}`);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const res = await fetch(url, {
        cache: "no-store",
        signal: controller.signal,
        ...init,
        credentials: "include",
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        let errorMessage = `API responded with ${res.status}: ${res.statusText}`;
        let errorDetails: any = null;

        try {
          const errorData = await res.json();
          if (errorData && typeof errorData === "object") {
            // many APIs retornam { message: "..." }
            errorMessage =
              (errorData as any).message ||
              (errorData as any).error ||
              errorMessage;
            errorDetails = errorData;
          }
        } catch {
          // tenta obter texto puro caso não seja JSON
          try {
            const text = await res.text();
            if (text) {
              errorMessage = text;
              // Tenta parsear como JSON se possível
              try {
                errorDetails = JSON.parse(text);
              } catch {
                errorDetails = { raw: text };
              }
            }
          } catch {
            /* ignore */
          }
        }

        const errorObj = new Error(errorMessage) as Error & {
          status?: number;
          details?: any;
        };
        errorObj.status = res.status;
        if (errorDetails) {
          errorObj.details = errorDetails;
        }
        
        // Silencia 404 se a opção estiver ativada (não loga como erro)
        if (env.isDevelopment) {
          if (res.status === 404 && silence404) {
            console.warn(`API 404 (silenciado) (${endpoint}): Endpoint não encontrado ou recurso não existe`);
          } else {
            console.error(`API Error ${res.status} (${endpoint}):`, {
              status: res.status,
              statusText: res.statusText,
              message: errorMessage,
              details: errorDetails,
            });
          }
        }
        
        if (res.status === 401 && !skipLogoutOn401) {
          logoutUser();
        }
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

      if (env.isDevelopment) {
        console.log(`✅ API Success: ${endpoint}`);
      }
      return data as T;
    } catch (error) {
      lastError = error as Error;

      // Não loga AbortError (requisição cancelada intencionalmente)
      if ((error as any)?.name !== "AbortError") {
        console.warn(`⚠️ API Error [${attempt}/${retries}]:`, error);
      }

      if ((error as any).status === 401) {
        break;
      }

      // Aguarda antes do próximo retry (backoff exponencial)
      if (attempt < retries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  if (lastError && (lastError as any)?.status === 401) {
    throw lastError;
  }

  // Se o erro for AbortError, apenas relança sem logar (requisição foi cancelada intencionalmente)
  if (
    (lastError as any)?.name === "AbortError" ||
    lastError?.message?.includes("aborted")
  ) {
    throw lastError!;
  }

  // Se chegou aqui, todas as tentativas falharam
  if (process.env.NODE_ENV === "development") {
    console.warn(`❌ API Failed após ${retries} tentativas:`, lastError!);
  } else {
    console.error(`❌ API Failed após ${retries} tentativas:`, lastError!);
  }

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
