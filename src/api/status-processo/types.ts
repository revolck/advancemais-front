// Tipos base para Status de Processo
export interface StatusProcesso {
  id: string;
  nome: string;
  descricao: string;
  ativo: boolean;
  isDefault: boolean;
  criadoPor: string;
  criadoEm: Date;
  atualizadoEm: Date;
}

// Tipos para criação
export interface CreateStatusProcessoInput {
  nome: string;
  descricao: string;
  ativo: boolean;
  isDefault: boolean;
}

// Tipos para atualização
export interface UpdateStatusProcessoInput {
  nome?: string;
  descricao?: string;
  ativo?: boolean;
  isDefault?: boolean;
}

// Tipos para reordenação removidos (ordem não é mais utilizada)

// Tipos para filtros
export interface StatusProcessoFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  ativo?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Tipos para paginação
export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// Tipos para respostas da API
export interface StatusProcessoListResponse {
  success: boolean;
  data: {
    statusProcessos: StatusProcesso[];
    pagination: PaginationInfo;
  };
}

export interface StatusProcessoResponse {
  success: boolean;
  data: StatusProcesso;
}

export interface StatusProcessoError {
  type: "VALIDATION" | "CONFLICT" | "NOT_FOUND" | "UNAUTHORIZED" | "SERVER";
  message: string;
  field?: string;
  code?: string;
}

// Tipos para validação de uso
export interface StatusProcessoUsageResponse {
  success: boolean;
  data: {
    isUsed: boolean;
    usageCount: number;
    usedIn: string[];
  };
}

// Constantes para validação
export const STATUS_PROCESSO_VALIDATION = {
  NOME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
  },
  DESCRICAO: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 500,
  },
} as const;

// Mensagens de erro
export const STATUS_PROCESSO_ERROR_MESSAGES = {
  NOME_REQUIRED: "Nome é obrigatório",
  NOME_INVALID: "Nome deve ter 2-100 caracteres",
  DESCRICAO_REQUIRED: "Descrição é obrigatória",
  DESCRICAO_INVALID: "Descrição deve ter 5-500 caracteres",
  DEFAULT_CONFLICT: "Já existe um status padrão",
  IN_USE: "Status não pode ser excluído pois está sendo usado",
  NOT_FOUND: "Status não encontrado",
  UNAUTHORIZED: "Não autorizado",
  SERVER_ERROR: "Erro interno do servidor",
} as const;
