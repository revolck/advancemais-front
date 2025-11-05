// Tipos para API de Auditoria

export type AuditoriaCategoria =
  | "SISTEMA"
  | "USUARIO"
  | "EMPRESA"
  | "VAGA"
  | "CURSO"
  | "PAGAMENTO"
  | "SCRIPT"
  | "SEGURANCA";

export interface AuditoriaLog {
  id: string;
  categoria: AuditoriaCategoria;
  tipo: string;
  acao: string;
  descricao: string;
  usuarioId?: string | null;
  entidadeId?: string | null;
  entidadeTipo?: string | null;
  dadosAntes?: any;
  dadosDepois?: any;
  ip?: string | null;
  userAgent?: string | null;
  criadoEm: string;
}

export interface AuditoriaLogsListParams {
  categoria?: AuditoriaCategoria | string;
  tipo?: string;
  usuarioId?: string;
  entidadeId?: string;
  entidadeTipo?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface Pagination {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Resposta paginada genérica para listas da Auditoria
export interface AuditoriaPaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type AuditoriaLogsListResponse = AuditoriaPaginatedResponse<AuditoriaLog>;

export type AuditoriaErrorCode =
  | "AUDITORIA_ACCESS_DENIED"
  | "AUDITORIA_LOG_NOT_FOUND"
  | "AUDITORIA_SCRIPT_NOT_FOUND"
  | "AUDITORIA_TRANSACAO_NOT_FOUND"
  | "AUDITORIA_USUARIO_NOT_FOUND"
  | "AUDITORIA_INVALID_FILTERS"
  | "AUDITORIA_EXPORT_ERROR"
  | "AUDITORIA_SCRIPT_EXECUTION_ERROR"
  | "AUDITORIA_PERMISSION_DENIED";

// Scripts
export type AuditoriaScriptTipo =
  | "MIGRACAO"
  | "BACKUP"
  | "LIMPEZA"
  | "RELATORIO"
  | "INTEGRACAO"
  | "MANUTENCAO";

export type AuditoriaScriptStatus =
  | "PENDENTE"
  | "EXECUTANDO"
  | "CONCLUIDO"
  | "ERRO"
  | "CANCELADO";

export interface AuditoriaScript {
  id: string;
  nome: string;
  descricao: string;
  tipo: AuditoriaScriptTipo;
  status: AuditoriaScriptStatus;
  comando: string;
  parametros?: any;
  executadoPor?: string;
  iniciadoEm?: string;
  finalizadoEm?: string;
  duracao?: number;
  resultado?: string;
  erro?: string | null;
  criadoEm: string;
}

export interface AuditoriaScriptsListParams {
  tipo?: AuditoriaScriptTipo | string;
  status?: AuditoriaScriptStatus | string;
  executadoPor?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export type AuditoriaScriptsListResponse = AuditoriaPaginatedResponse<AuditoriaScript>;

export interface CreateAuditoriaScriptPayload {
  nome: string;
  descricao?: string;
  tipo: AuditoriaScriptTipo;
  comando: string;
  parametros?: any;
  agendadoPara?: string;
}

export type UpdateAuditoriaScriptPayload = Partial<
  Pick<AuditoriaScript, "nome" | "descricao" | "parametros">
>;

// Transações
export type AuditoriaTransacaoTipo =
  | "PAGAMENTO"
  | "REEMBOLSO"
  | "ESTORNO"
  | "ASSINATURA"
  | "CUPOM"
  | "TAXA";

export type AuditoriaTransacaoStatus =
  | "PENDENTE"
  | "PROCESSANDO"
  | "APROVADA"
  | "RECUSADA"
  | "CANCELADA"
  | "ESTORNADA";

export interface AuditoriaTransacao {
  id: string;
  tipo: AuditoriaTransacaoTipo;
  status: AuditoriaTransacaoStatus;
  valor: number;
  moeda: string;
  usuarioId?: string;
  empresaId?: string;
  gateway?: string;
  gatewayId?: string;
  descricao?: string;
  dadosAdicionais?: any;
  criadoEm: string;
  atualizadoEm: string;
}

export interface AuditoriaTransacoesListParams {
  tipo?: AuditoriaTransacaoTipo | string;
  status?: AuditoriaTransacaoStatus | string;
  usuarioId?: string;
  empresaId?: string;
  gateway?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export type AuditoriaTransacoesListResponse = AuditoriaPaginatedResponse<AuditoriaTransacao>;

export interface CreateAuditoriaTransacaoPayload {
  tipo: AuditoriaTransacaoTipo;
  valor: number;
  moeda: string;
  usuarioId?: string;
  empresaId?: string;
  gateway?: string;
  gatewayId?: string;
  descricao?: string;
  dadosAdicionais?: any;
}

export type UpdateAuditoriaTransacaoPayload = Partial<
  Pick<AuditoriaTransacao, "status" | "descricao" | "dadosAdicionais">
>;

export interface UpdateAuditoriaTransacaoStatusPayload {
  status: AuditoriaTransacaoStatus;
  observacoes?: string;
}

// Estatísticas
export interface AuditoriaEstatisticasLogs {
  totalLogs: number;
  logsPorCategoria: Record<string, number>;
  logsPorTipo: Record<string, number>;
  periodo: { inicio: string; fim: string };
}

// Assinaturas
export interface AuditoriaAssinaturasListParams {
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  usuarioId?: string;
  empresasPlanoId?: string;
  tipo?: string;
  status?: string;
}
