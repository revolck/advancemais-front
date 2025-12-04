// src/theme/website/components/checkout/utils/formatters.ts

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

export function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 2) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  return digits;
}

export function formatCVV(value: string): string {
  return value.replace(/\D/g, "").slice(0, 4);
}

export function formatCNPJ(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

export function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

/**
 * Remove formatação do documento (pontos, traços, barras)
 */
export function sanitizeDocument(doc: string): string {
  return doc.replace(/\D/g, "");
}

/**
 * Detecta o tipo de documento baseado no tamanho
 */
export function getDocumentType(doc: string): "CPF" | "CNPJ" {
  const clean = sanitizeDocument(doc);
  return clean.length <= 11 ? "CPF" : "CNPJ";
}

/**
 * Valida CPF matematicamente usando os dígitos verificadores
 * @param cpf - CPF com ou sem formatação
 * @returns true se o CPF é válido
 */
export function isValidCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, "");

  // Deve ter 11 dígitos
  if (digits.length !== 11) return false;

  // Não pode ser sequência repetida (ex: 111.111.111-11)
  if (/^(\d)\1+$/.test(digits)) return false;

  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i]) * (10 - i);
  }
  let rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  if (rest !== parseInt(digits[9])) return false;

  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits[i]) * (11 - i);
  }
  rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;

  return rest === parseInt(digits[10]);
}

/**
 * Valida CNPJ matematicamente usando os dígitos verificadores
 * @param cnpj - CNPJ com ou sem formatação
 * @returns true se o CNPJ é válido
 */
export function isValidCNPJ(cnpj: string): boolean {
  const digits = cnpj.replace(/\D/g, "");

  // Deve ter 14 dígitos
  if (digits.length !== 14) return false;

  // Não pode ser sequência repetida (ex: 11.111.111/1111-11)
  if (/^(\d)\1+$/.test(digits)) return false;

  // Pesos para cálculo dos dígitos verificadores
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits[i]) * weights1[i];
  }
  let rest = sum % 11;
  const digit1 = rest < 2 ? 0 : 11 - rest;
  if (digit1 !== parseInt(digits[12])) return false;

  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(digits[i]) * weights2[i];
  }
  rest = sum % 11;
  const digit2 = rest < 2 ? 0 : 11 - rest;

  return digit2 === parseInt(digits[13]);
}

/**
 * Valida documento (CPF ou CNPJ) automaticamente
 * @param doc - Documento com ou sem formatação
 * @returns objeto com resultado da validação
 */
export function validateDocument(doc: string): {
  valid: boolean;
  type: "CPF" | "CNPJ";
  message?: string;
} {
  const clean = sanitizeDocument(doc);
  const type = getDocumentType(doc);

  if (type === "CPF") {
    if (clean.length !== 11) {
      return {
        valid: false,
        type,
        message: "CPF deve ter 11 dígitos",
      };
    }
    if (!isValidCPF(clean)) {
      return {
        valid: false,
        type,
        message: "CPF inválido. Verifique os dígitos informados.",
      };
    }
  } else {
    if (clean.length !== 14) {
      return {
        valid: false,
        type,
        message: "CNPJ deve ter 14 dígitos",
      };
    }
    if (!isValidCNPJ(clean)) {
      return {
        valid: false,
        type,
        message: "CNPJ inválido. Verifique os dígitos informados.",
      };
    }
  }

  return { valid: true, type };
}

