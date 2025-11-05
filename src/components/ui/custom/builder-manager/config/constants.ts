import type { BuilderItemType } from "../types";

/**
 * Constantes do BuilderManager
 * Centraliza strings e configurações reutilizáveis
 */

/**
 * Mapeamento de tipos de item para labels em português
 */
export const ITEM_TYPE_LABELS: Record<
  BuilderItemType,
  { singular: string; plural: string; icon: string }
> = {
  AULA: {
    singular: "Aula",
    plural: "Aulas",
    icon: "Video",
  },
  PROVA: {
    singular: "Prova",
    plural: "Provas",
    icon: "FileText",
  },
  ATIVIDADE: {
    singular: "Atividade",
    plural: "Atividades",
    icon: "ClipboardList",
  },
};

/**
 * Retorna o label formatado de um tipo de item
 */
export function getItemTypeLabel(
  type: BuilderItemType,
  lowercase = false
): string {
  const label = ITEM_TYPE_LABELS[type].singular;
  return lowercase ? label.toLowerCase() : label;
}

/**
 * Retorna o ícone de um tipo de item
 */
export function getItemTypeIcon(type: BuilderItemType): string {
  return ITEM_TYPE_LABELS[type].icon;
}

/**
 * Cores dos badges por tipo de item
 */
export const ITEM_TYPE_COLORS: Record<BuilderItemType, string> = {
  AULA: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  PROVA: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  ATIVIDADE: "bg-green-500/10 text-green-600 border-green-500/20",
};

/**
 * Mensagens de sucesso
 */
export const SUCCESS_MESSAGES = {
  MODULE_CREATED: "Módulo criado com sucesso!",
  MODULE_UPDATED: "Módulo atualizado com sucesso!",
  MODULE_DELETED: "Módulo excluído com sucesso!",
  ITEM_CREATED: "Item criado com sucesso!",
  ITEM_UPDATED: "Item atualizado com sucesso!",
  ITEM_DELETED: "Item excluído com sucesso!",
  CHANGES_SAVED: "Alterações salvas com sucesso!",
};

/**
 * Mensagens de erro
 */
export const ERROR_MESSAGES = {
  MODULE_NOT_FOUND: "Módulo não encontrado",
  ITEM_NOT_FOUND: "Item não encontrado",
  GENERIC_ERROR: "Ocorreu um erro. Tente novamente.",
};

/**
 * Placeholders
 */
export const PLACEHOLDERS = {
  MODULE_TITLE: "Ex: Introdução ao Excel",
  ITEM_TITLE: {
    AULA: "Ex: Introdução ao tema",
    PROVA: "Ex: Prova do módulo",
    ATIVIDADE: "Ex: Atividade do módulo",
  },
  SELECT_ACTIVITY: "Selecione uma atividade",
  SELECT_EXAM: "Selecione uma prova",
  SELECT_INSTRUCTOR: "Selecionar instrutores",
};
