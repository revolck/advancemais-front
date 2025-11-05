// Re-exporta tipos da API
export type {
  StatusProcesso,
  CreateStatusProcessoInput,
  UpdateStatusProcessoInput,
  StatusProcessoFilters,
  PaginationInfo,
  StatusProcessoError,
  StatusProcessoUsageResponse,
} from "@/api/status-processo/types";

// Re-exporta constantes de validação
export {
  STATUS_PROCESSO_VALIDATION,
  STATUS_PROCESSO_ERROR_MESSAGES,
} from "@/api/status-processo/types";

// Importa tipos para uso local
import type { StatusProcesso } from "@/api/status-processo/types";
import { STATUS_PROCESSO_VALIDATION } from "@/api/status-processo/types";

// Interface para Formulário (compatível com a API)
export interface StatusProcessoFormData {
  nome: string;
  descricao: string;
  ativo: boolean;
  isDefault: boolean;
}

// Interface para ListItem (compatível com ListManager)
export interface StatusProcessoListItem {
  id: string;
  title: string;
  description: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  // Campos específicos do status
  isDefault: boolean;
  criadoPor: string;
}

// Funções de validação
// Código removido da API; validação não é mais necessária
export const validateCodigo = () => true;

export const validateNome = (nome: string): boolean => {
  return (
    nome.length >= STATUS_PROCESSO_VALIDATION.NOME.MIN_LENGTH &&
    nome.length <= STATUS_PROCESSO_VALIDATION.NOME.MAX_LENGTH
  );
};

export const validateDescricao = (descricao: string): boolean => {
  return (
    descricao.length >= STATUS_PROCESSO_VALIDATION.DESCRICAO.MIN_LENGTH &&
    descricao.length <= STATUS_PROCESSO_VALIDATION.DESCRICAO.MAX_LENGTH
  );
};

export const validateOrdem = (ordem: number): boolean => {
  return true;
};

// Funções de formatação
export const formatStatusDisplay = (status: StatusProcesso): string => {
  return status.nome;
};

export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Funções de mapeamento
export const mapStatusProcessoToListItem = (
  status: StatusProcesso
): StatusProcessoListItem => {
  return {
    id: status.id,
    title: status.nome,
    description: status.descricao,
    status: status.ativo,
    createdAt: status.criadoEm.toISOString(),
    updatedAt: status.atualizadoEm.toISOString(),
    isDefault: status.isDefault,
    criadoPor: status.criadoPor,
  };
};

export const mapListItemToStatusProcesso = (
  item: StatusProcessoListItem
): StatusProcesso => {
  return {
    id: item.id,
    nome: item.title,
    descricao: item.description,
    ativo: item.status,
    isDefault: item.isDefault,
    criadoPor: item.criadoPor,
    criadoEm: new Date(item.createdAt),
    atualizadoEm: new Date(item.updatedAt),
  };
};

export const mapFormDataToCreateInput = (formData: StatusProcessoFormData) => {
  return {
    nome: formData.nome,
    descricao: formData.descricao,
    ativo: formData.ativo,
    isDefault: formData.isDefault,
  };
};

export const mapFormDataToUpdateInput = (formData: StatusProcessoFormData) => {
  return {
    nome: formData.nome,
    descricao: formData.descricao,
    ativo: formData.ativo,
    isDefault: formData.isDefault,
  };
};
