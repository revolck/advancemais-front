import type {
  VagaCreateApiResponse,
  VagaErrorResponse,
  VagaValidationError,
  VagaLimitReachedError,
} from "@/api/vagas";

/**
 * Verifica se a resposta da API é um erro
 */
export function isErrorResponse(
  response: VagaCreateApiResponse
): response is VagaErrorResponse | VagaValidationError | VagaLimitReachedError {
  return (
    typeof response === "object" &&
    response !== null &&
    "success" in response &&
    response.success === false
  );
}

/**
 * Converte string para slug (URL-friendly)
 */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .replace(/-{2,}/g, "-");
}

/**
 * Converte texto multilinha em array de strings
 */
export function parseMultiline(value: string): string[] {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

/**
 * Converte string para número ou mantém como string
 */
export function toNumericOrString(value: string): number | string {
  const numeric = Number(value);
  return Number.isNaN(numeric) ? value : numeric;
}

/**
 * Verifica se o texto contém informações proibidas (email, URL, telefone)
 */
export function containsProhibitedInfo(value: string): boolean {
  if (!value) return false;

  const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
  const urlRegex = /(https?:\/\/|www\.)\S+/i;
  const phoneRegex =
    /\b(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,3}\)?[\s.-]?)?\d{4,5}[\s.-]?\d{4}\b/;

  return (
    emailRegex.test(value) || urlRegex.test(value) || phoneRegex.test(value)
  );
}
