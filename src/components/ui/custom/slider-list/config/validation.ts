/**
 * Configurações de validação
 */
import { SLIDER_CONFIG } from "./constants";
import { formatFileSize } from "../utils/formatters";

/**
 * Mensagens de erro padrão
 */
export const SLIDER_ERROR_MESSAGES = {
  // Validação de arquivo
  FILE_REQUIRED: "É necessário fornecer uma imagem ou URL",
  FILE_TOO_LARGE: `Arquivo muito grande. Máximo ${formatFileSize(
    SLIDER_CONFIG.MAX_FILE_SIZE
  )}`,
  FILE_TYPE_INVALID: "Tipo de arquivo não suportado. Use JPEG, PNG ou WebP",

  // Validação de URL
  URL_INVALID: "URL inválida",
  IMAGE_URL_INVALID: "URL da imagem inválida",
  LINK_URL_INVALID: "URL do link inválida",

  // Validação de ordem
  ORDER_REQUIRED: "Ordem é obrigatória",
  ORDER_RANGE: `Ordem deve ser entre 1 e ${SLIDER_CONFIG.MAX_SLIDERS}`,

  // Limitações
  MAX_SLIDERS_REACHED: `Máximo de ${SLIDER_CONFIG.MAX_SLIDERS} sliders permitidos`,
  MIN_SLIDERS_REQUIRED: `Deve haver pelo menos ${SLIDER_CONFIG.MIN_SLIDERS} slider na lista`,

  // API
  LOAD_FAILED: "Falha ao carregar lista de sliders",
  CREATE_FAILED: "Falha ao criar slider",
  UPDATE_FAILED: "Falha ao atualizar slider",
  DELETE_FAILED: "Falha ao remover slider",
  REORDER_FAILED: "Falha ao reordenar sliders",
} as const;

/**
 * Mensagens de sucesso padrão
 */
export const SLIDER_SUCCESS_MESSAGES = {
  CREATED: "Slider adicionado com sucesso!",
  UPDATED: "Slider atualizado com sucesso!",
  DELETED: "Slider removido com sucesso!",
  PUBLISHED: "Slider publicado com sucesso!",
  UNPUBLISHED: "Slider despublicado com sucesso!",
  REORDERED: "Sliders reordenados com sucesso!",
} as const;

/**
 * Regras de validação
 */
export const VALIDATION_RULES = {
  /** Valida se é uma URL válida */
  isValidUrl: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /** Valida tipo de arquivo */
  isValidFileType: (file: File): boolean => {
    return SLIDER_CONFIG.ACCEPTED_FILE_TYPES.includes(file.type as any);
  },

  /** Valida tamanho de arquivo */
  isValidFileSize: (file: File): boolean => {
    return file.size <= SLIDER_CONFIG.MAX_FILE_SIZE;
  },

  /** Valida ordem */
  isValidOrder: (order: number): boolean => {
    return order >= 1 && order <= SLIDER_CONFIG.MAX_SLIDERS;
  },
} as const;
