// src/theme/website/components/checkout/utils/formatters.ts

import {
  formatCnpj,
  formatCpf,
  getLoginDocumentType,
  isValidCnpj,
  isValidCpf,
  normalizeCnpj,
  normalizeCpf,
  normalizeLoginDocument,
} from "@/lib/documentos";

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
  return formatCnpj(value);
}

export function formatCPF(value: string): string {
  return formatCpf(value);
}

/**
 * Remove formatação do documento (pontos, traços, barras)
 */
export function sanitizeDocument(doc: string): string {
  return normalizeLoginDocument(doc);
}

/**
 * Detecta o tipo de documento baseado no tamanho
 */
export function getDocumentType(doc: string): "CPF" | "CNPJ" {
  return getLoginDocumentType(doc) ?? "CPF";
}

/**
 * Valida CPF matematicamente usando os dígitos verificadores
 * @param cpf - CPF com ou sem formatação
 * @returns true se o CPF é válido
 */
export function isValidCPF(cpf: string): boolean {
  return isValidCpf(cpf);
}

/**
 * Valida CNPJ matematicamente usando os dígitos verificadores
 * @param cnpj - CNPJ com ou sem formatação
 * @returns true se o CNPJ é válido
 */
export function isValidCNPJ(cnpj: string): boolean {
  return isValidCnpj(cnpj);
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
    if (normalizeCpf(clean).length !== 11) {
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
    if (normalizeCnpj(clean).length !== 14) {
      return {
        valid: false,
        type,
        message: "CNPJ deve ter 14 caracteres",
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
