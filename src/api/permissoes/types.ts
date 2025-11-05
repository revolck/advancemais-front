// Tipos auxiliares
export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export type PermissaoErrorCode =
  | "RESOURCE_NOT_FOUND"
  | "GRANT_NOT_FOUND"
  | "INVALID_ROLE"
  | "INVALID_USER"
  | "INVALID_RESOURCE"
  | "INVALID_ACTION"
  | "GRANT_ALREADY_EXISTS"
  | "INVALID_CONDITIONS"
  | "INVALID_PRIORITY"
  | "INVALID_EXPIRATION"
  | "INSUFFICIENT_PERMISSIONS"
  | "AUDIT_LOG_ERROR";

// Recursos
export interface PermissaoRecurso {
  id: string;
  nome: string;
  descricao?: string;
  categoria: string;
  ativo: boolean;
  criadoEm: string;
  criadoPor: {
    id: string;
    nome: string;
  };
}

export interface PermissaoRecursoCreatePayload {
  nome: string;
  descricao?: string;
  categoria: string;
}

export interface PermissaoRecursoListParams {
  categoria?: string;
  ativo?: boolean;
}

export interface PermissaoRecursoListResponse {
  data: PermissaoRecurso[];
}

export interface PermissaoRecursoCreateResponse {
  data: PermissaoRecurso;
}

// Grants
export interface PermissaoGrant {
  id: string;
  tipo: "usuario" | "role";
  role?: string;
  usuarioId?: string;
  usuario?: {
    nome: string;
    email: string;
  };
  recurso: string;
  acao: string;
  permitido: boolean;
  condicoes?: Record<string, any> | null;
  prioridade: number;
  razao?: string;
  expiraEm?: string;
  ativo: boolean;
  criadoEm: string;
  criadoPor: {
    id: string;
    nome: string;
  };
  atualizadoEm?: string;
  atualizadoPor?: {
    id: string;
    nome: string;
  };
}

export interface PermissaoGrantListParams {
  role?: string;
  usuarioId?: string;
  recurso?: string;
  acao?: string;
  ativo?: boolean;
  page?: number;
  pageSize?: number;
}

export interface CreateGrantPayload {
  role?: string | null;
  usuarioId?: string | null;
  recurso: string;
  acao: string;
  permitido: boolean;
  condicoes?: Record<string, any>;
  prioridade?: number;
  razao?: string;
  expiraEm?: string; // ISO date
}

export interface UpdateGrantPayload {
  tipo?: "usuario" | "role";
  permitido?: boolean;
  condicoes?: Record<string, any>;
  prioridade?: number;
  razao?: string;
  expiraEm?: string; // ISO date
}

export interface PermissaoGrantListResponse {
  data: PermissaoGrant[];
  pagination?: Pagination;
}

export interface PermissaoGrantCreateResponse {
  data: PermissaoGrant;
}

export interface PermissaoGrantUpdateResponse {
  data: PermissaoGrant;
}

export interface PermissaoGrantDeleteResponse {
  message: string;
  data: {
    id: string;
    tipo?: "usuario" | "role";
    deletadoEm: string;
    deletadoPor: {
      id: string;
      nome: string;
    };
  };
}

// Auditoria
export interface AuditoriaAcessoItem {
  id: string;
  usuarioId: string;
  usuario: {
    nome: string;
    email: string;
    role: string;
  };
  recurso: string;
  acao: string;
  permitido: boolean;
  razao?: string;
  ip?: string;
  userAgent?: string;
  contexto?: Record<string, any>;
  timestamp: string;
}

export interface AuditoriaListParams {
  usuarioId?: string;
  recurso?: string;
  acao?: string;
  permitido?: boolean;
  dataInicio?: string; // ISO
  dataFim?: string; // ISO
  page?: number;
  pageSize?: number;
}

export interface AuditoriaListResponse {
  data: AuditoriaAcessoItem[];
  pagination: Pagination;
  summary?: {
    totalAcessos: number;
    permitidos: number;
    negados: number;
    periodo?: { inicio: string; fim: string };
  };
}

// Minhas permissões
export interface MinhasPermissoesResponse {
  data: {
    usuario: {
      id: string;
      nome: string;
      email: string;
      role: string;
    };
    permissoes: Array<{
      recurso: string;
      acao: string;
      permitido: boolean;
      tipo: "role" | "usuario";
      condicoes?: Record<string, any>;
      prioridade: number;
      expiraEm?: string;
    }>;
    resumo: {
      totalPermissoes: number;
      porTipo: Record<string, number>;
      porRecurso: Record<string, number>;
    };
  };
}
