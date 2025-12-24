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
  PROVA: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  ATIVIDADE: "bg-amber-500/10 text-amber-600 border-amber-500/20",
};

/**
 * Metadata de tipos de item (label + classes CSS)
 */
export const TYPE_META: Record<
  BuilderItemType,
  { label: string; cls: string }
> = {
  AULA: { label: "Aula", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  ATIVIDADE: {
    label: "Atividade",
    cls: "bg-amber-50 text-amber-700 border-amber-200",
  },
  PROVA: {
    label: "Prova",
    cls: "bg-rose-50 text-rose-700 border-rose-200",
  },
};

/**
 * Cor do ícone por tipo de item
 */
export const TYPE_ICON_CLS: Record<BuilderItemType, string> = {
  AULA: "text-blue-700",
  ATIVIDADE: "text-amber-700",
  PROVA: "text-rose-700",
};

/**
 * Retorna o nome do ícone baseado no tipo de item
 */
export function getIconForType(type: BuilderItemType): string {
  switch (type) {
    case "PROVA":
      return "FileText";
    case "ATIVIDADE":
      return "Paperclip";
    default:
      return "GraduationCap";
  }
}

/**
 * Estilos para itens por tipo (usado em cards de item)
 */
export const ITEM_TYPE_STYLES: Record<
  BuilderItemType,
  {
    border: string;
    bg: string;
    hoverBg: string;
    iconBg: string;
    iconColor: string;
    selectedRing: string;
  }
> = {
  AULA: {
    border: "border-blue-200",
    bg: "bg-blue-50/50",
    hoverBg: "hover:bg-blue-50",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    selectedRing: "ring-blue-300",
  },
  ATIVIDADE: {
    border: "border-amber-200",
    bg: "bg-amber-50/50",
    hoverBg: "hover:bg-amber-50",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    selectedRing: "ring-amber-300",
  },
  PROVA: {
    border: "border-rose-200",
    bg: "bg-rose-50/50",
    hoverBg: "hover:bg-rose-50",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
    selectedRing: "ring-rose-300",
  },
};

/**
 * Estilos para DragOverlay por tipo de item
 */
export const DRAG_OVERLAY_STYLES: Record<
  BuilderItemType,
  { bg: string; border: string; text: string; icon: string }
> = {
  AULA: {
    bg: "bg-blue-100",
    border: "border-blue-300",
    text: "text-blue-600",
    icon: "GraduationCap",
  },
  ATIVIDADE: {
    bg: "bg-amber-100",
    border: "border-amber-300",
    text: "text-amber-600",
    icon: "Paperclip",
  },
  PROVA: {
    bg: "bg-rose-100",
    border: "border-rose-300",
    text: "text-rose-600",
    icon: "FileText",
  },
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
