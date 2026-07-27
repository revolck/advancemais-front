export type DocumentType = "CPF" | "CNPJ";

const CNPJ_WEIGHTS_FIRST_DIGIT = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] as const;
const CNPJ_WEIGHTS_SECOND_DIGIT = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] as const;

export function normalizeCpf(value: unknown): string {
  return String(value ?? "").replace(/\D/g, "");
}

export function normalizeCnpj(value: unknown): string {
  return String(value ?? "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase();
}

export function normalizeCnpjForInput(value: unknown): string {
  const normalized = normalizeCnpj(value);
  let result = "";

  for (const char of normalized) {
    if (result.length < 12) {
      result += char;
    } else if (result.length < 14 && /\d/.test(char)) {
      result += char;
    }

    if (result.length >= 14) break;
  }

  return result;
}

export function normalizeLoginDocument(value: unknown): string {
  return normalizeCnpj(value);
}

export function getLoginDocumentType(value: unknown): DocumentType | null {
  const normalized = normalizeLoginDocument(value);
  if (!normalized) return null;

  if (/[A-Z]/.test(normalized)) {
    return normalized.length === 14 ? "CNPJ" : null;
  }

  if (/^\d{11}$/.test(normalized)) return "CPF";
  if (/^\d{14}$/.test(normalized)) return "CNPJ";

  return null;
}

export function formatCpf(value: unknown): string {
  const digits = normalizeCpf(value).slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function formatCnpj(value: unknown): string {
  const normalized = normalizeCnpjForInput(value);
  return normalized
    .replace(/^([A-Z0-9]{2})([A-Z0-9])/, "$1.$2")
    .replace(/^([A-Z0-9]{2})\.([A-Z0-9]{3})([A-Z0-9])/, "$1.$2.$3")
    .replace(/\.([A-Z0-9]{3})([A-Z0-9])/, ".$1/$2")
    .replace(/([A-Z0-9]{4})(\d{1,2})$/, "$1-$2");
}

export function formatCpfCnpj(value: unknown): string {
  const normalized = normalizeLoginDocument(value);
  if (!normalized) return "";

  if (/[A-Z]/.test(normalized)) return formatCnpj(normalized);
  return normalized.length > 11 ? formatCnpj(normalized) : formatCpf(normalized);
}

export function isValidCpf(value: unknown): boolean {
  const cpf = normalizeCpf(value);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += Number(cpf[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== Number(cpf[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += Number(cpf[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  return remainder === Number(cpf[10]);
}

function calculateCnpjDigit(base: string, weights: readonly number[]): number {
  const sum = weights.reduce((total, weight, index) => {
    return total + (base.charCodeAt(index) - 48) * weight;
  }, 0);
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

export function isValidCnpj(value: unknown): boolean {
  const cnpj = normalizeCnpj(value);
  if (!/^[A-Z0-9]{12}\d{2}$/.test(cnpj)) return false;

  const firstDigit = calculateCnpjDigit(cnpj, CNPJ_WEIGHTS_FIRST_DIGIT);
  if (firstDigit !== Number(cnpj[12])) return false;

  const secondDigit = calculateCnpjDigit(cnpj, CNPJ_WEIGHTS_SECOND_DIGIT);
  return secondDigit === Number(cnpj[13]);
}

export function isValidCpfCnpj(value: unknown): boolean {
  const type = getLoginDocumentType(value);
  if (type === "CPF") return isValidCpf(value);
  if (type === "CNPJ") return isValidCnpj(value);
  return false;
}
