import { NextRequest, NextResponse } from "next/server";
import { apiLogger } from "../logger";
import { RateLimiter } from "../security";

// Tipos para resposta de API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

// Rate limiter para APIs
const apiRateLimiter = new RateLimiter(100, 1); // 100 requisições por minuto por IP

/**
 * Obtém o IP do cliente a partir da requisição
 */
export function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return "127.0.0.1";
}

/**
 * Handler genérico para rotas de API
 * Lida com erros, logging e formatação padronizada de respostas
 */
export function apiHandler<T>(
  handler: (req: NextRequest) => Promise<T>,
  options?: {
    rateLimit?: boolean;
    requireAuth?: boolean;
  }
) {
  return async (req: NextRequest) => {
    const method = req.method;
    const url = req.url;
    const clientIp = getClientIp(req);
    const timestamp = new Date().toISOString();

    // Rate limiting
    if (options?.rateLimit !== false) {
      const rateLimitKey = `api:${clientIp}`;

      if (apiRateLimiter.hasReachedLimit(rateLimitKey)) {
        apiLogger.response(method, url, 429, { message: "Too many requests" });

        return NextResponse.json(
          {
            success: false,
            error: {
              code: "RATE_LIMIT_EXCEEDED",
              message: "Too many requests. Please try again later.",
            },
            timestamp,
          } as ApiResponse<null>,
          { status: 429 }
        );
      }

      apiRateLimiter.increment(rateLimitKey);
    }

    // Log da requisição
    let requestBody;
    try {
      if (method !== "GET" && method !== "HEAD") {
        requestBody = await req.clone().json();
      }
    } catch (e) {
      // Ignora erro ao tentar obter o body
    }

    apiLogger.request(method, url, requestBody);

    // Verificação de autenticação
    if (options?.requireAuth) {
      const authToken = req.cookies.get("auth-token")?.value;

      if (!authToken) {
        apiLogger.response(method, url, 401, { message: "Unauthorized" });

        return NextResponse.json(
          {
            success: false,
            error: {
              code: "UNAUTHORIZED",
              message: "Authentication required",
            },
            timestamp,
          } as ApiResponse<null>,
          { status: 401 }
        );
      }

      // Aqui você pode adicionar verificação do token
      // Ex: const user = await verifyToken(authToken);
    }

    try {
      // Executa o handler da rota
      const result = await handler(req);

      apiLogger.response(method, url, 200, result);

      // Retorna resposta bem-sucedida
      return NextResponse.json(
        {
          success: true,
          data: result,
          timestamp,
        } as ApiResponse<T>,
        { status: 200 }
      );
    } catch (error: any) {
      // Log do erro
      apiLogger.error(
        method,
        url,
        error instanceof Error ? error : new Error(String(error))
      );

      // Determina o código de status HTTP com base no erro
      let status = 500;
      let errorCode = "INTERNAL_SERVER_ERROR";
      let errorMessage = "An unexpected error occurred";

      if (error.code === "NOT_FOUND") {
        status = 404;
        errorCode = "NOT_FOUND";
        errorMessage = error.message || "Resource not found";
      } else if (error.code === "BAD_REQUEST") {
        status = 400;
        errorCode = "BAD_REQUEST";
        errorMessage = error.message || "Invalid request";
      } else if (error.code === "UNAUTHORIZED") {
        status = 401;
        errorCode = "UNAUTHORIZED";
        errorMessage = error.message || "Authentication required";
      } else if (error.code === "FORBIDDEN") {
        status = 403;
        errorCode = "FORBIDDEN";
        errorMessage = error.message || "Access denied";
      }

      // Retorna resposta de erro
      return NextResponse.json(
        {
          success: false,
          error: {
            code: errorCode,
            message: errorMessage,
            details:
              process.env.NODE_ENV === "development"
                ? {
                    stack: error.stack,
                    ...error,
                  }
                : undefined,
          },
          timestamp,
        } as ApiResponse<null>,
        { status }
      );
    }
  };
}

/**
 * Função utilitária para criar erros de API com código
 */
export function createApiError(
  code: string,
  message: string
): Error & { code: string } {
  const error = new Error(message) as Error & { code: string };
  error.code = code;
  return error;
}

/**
 * Classes de erro para API
 */
export class ApiError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export class NotFoundError extends ApiError {
  constructor(message = "Resource not found") {
    super("NOT_FOUND", message);
  }
}

export class BadRequestError extends ApiError {
  constructor(message = "Invalid request") {
    super("BAD_REQUEST", message);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "Authentication required") {
    super("UNAUTHORIZED", message);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = "Access denied") {
    super("FORBIDDEN", message);
  }
}

export class InternalServerError extends ApiError {
  constructor(message = "An unexpected error occurred") {
    super("INTERNAL_SERVER_ERROR", message);
  }
}
