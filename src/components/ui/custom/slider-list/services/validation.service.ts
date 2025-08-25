import { VALIDATION_RULES, SLIDER_ERROR_MESSAGES } from "../config";
import type { SliderFormData, ValidationResult } from "../types";

/**
 * Valida dados do formulário de slider
 */
export function validateSliderForm(data: SliderFormData): ValidationResult {
  const errors: Record<string, string> = {};

  // Validação de imagem
  if (!data.imagem && !data.imagemUrl) {
    errors.imagemUrl = SLIDER_ERROR_MESSAGES.FILE_REQUIRED;
  }

  // Validação de URL da imagem (se fornecida)
  if (data.imagemUrl && !VALIDATION_RULES.isValidUrl(data.imagemUrl)) {
    errors.imagemUrl = SLIDER_ERROR_MESSAGES.IMAGE_URL_INVALID;
  }

  // Validação de link (se fornecido)
  if (data.link && !VALIDATION_RULES.isValidUrl(data.link)) {
    errors.link = SLIDER_ERROR_MESSAGES.LINK_URL_INVALID;
  }

  // Validação de ordem
  if (!data.ordem || !VALIDATION_RULES.isValidOrder(data.ordem)) {
    errors.ordem = SLIDER_ERROR_MESSAGES.ORDER_RANGE;
  }

  // Validação de arquivo
  if (data.imagem) {
    if (!VALIDATION_RULES.isValidFileType(data.imagem)) {
      errors.file = SLIDER_ERROR_MESSAGES.FILE_TYPE_INVALID;
    }

    if (!VALIDATION_RULES.isValidFileSize(data.imagem)) {
      errors.file = SLIDER_ERROR_MESSAGES.FILE_TOO_LARGE;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Valida URL de imagem
 */
export function validateImageUrl(url: string): {
  isValid: boolean;
  error?: string;
} {
  if (!url) {
    return { isValid: false, error: SLIDER_ERROR_MESSAGES.FILE_REQUIRED };
  }

  if (!VALIDATION_RULES.isValidUrl(url)) {
    return { isValid: false, error: SLIDER_ERROR_MESSAGES.IMAGE_URL_INVALID };
  }

  return { isValid: true };
}

/**
 * Valida arquivo de imagem
 */
export function validateImageFile(file: File): {
  isValid: boolean;
  error?: string;
} {
  if (!VALIDATION_RULES.isValidFileType(file)) {
    return { isValid: false, error: SLIDER_ERROR_MESSAGES.FILE_TYPE_INVALID };
  }

  if (!VALIDATION_RULES.isValidFileSize(file)) {
    return { isValid: false, error: SLIDER_ERROR_MESSAGES.FILE_TOO_LARGE };
  }

  return { isValid: true };
}

/**
 * Valida link de destino
 */
export function validateLink(link: string): {
  isValid: boolean;
  error?: string;
} {
  if (!link) {
    return { isValid: true }; // Link é opcional
  }

  if (!VALIDATION_RULES.isValidUrl(link)) {
    return { isValid: false, error: SLIDER_ERROR_MESSAGES.LINK_URL_INVALID };
  }

  return { isValid: true };
}

/**
 * Valida ordem do slider
 */
export function validateOrder(ordem: number): {
  isValid: boolean;
  error?: string;
} {
  if (!ordem || !VALIDATION_RULES.isValidOrder(ordem)) {
    return { isValid: false, error: SLIDER_ERROR_MESSAGES.ORDER_RANGE };
  }

  return { isValid: true };
}
