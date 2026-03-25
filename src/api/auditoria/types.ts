// Tipos para API de Auditoria

export type AuditoriaCategoria =
  | "SISTEMA"
  | "USUARIO"
  | "EMPRESA"
  | "VAGA"
  | "CURSO"
  | "PAGAMENTO"
  | "SCRIPT"
  | "SEGURANCA"
  | (string & {});

export interface AuditoriaActor {
  id?: string | null;
  nome: string;
  role?: string | null;
  roleLabel?: string | null;
  avatarUrl?: string | null;
}

export interface AuditoriaEntidade {
  id?: string | null;
  tipo?: string | null;
  codigo?: string | null;
  nomeExibicao?: string | null;
}

export interface AuditoriaContexto {
  ip?: string | null;
  userAgent?: string | null;
  origem?: string | null;
}

export interface AuditoriaFiltroDisponivel {
  value: string;
  label: string;
  count?: number;
}

export interface AuditoriaFiltrosDisponiveis {
  categorias?: AuditoriaFiltroDisponivel[];
  tipos?: AuditoriaFiltroDisponivel[];
}

export interface AuditoriaResumo {
  total?: number;
  ultimoEventoEm?: string | null;
}

export interface AuditoriaLog {
  id: string;
  categoria: AuditoriaCategoria;
  tipo: string;
  acao: string;
  descricao: string;
  dataHora?: string;
  ator?: AuditoriaActor | null;
  entidade?: AuditoriaEntidade | null;
  contexto?: AuditoriaContexto | null;
  dadosAnteriores?: any;
  dadosNovos?: any;
  meta?: Record<string, any> | null;
  // Compatibilidade com contratos antigos ainda presentes no projeto
  usuarioId?: string | null;
  entidadeId?: string | null;
  entidadeTipo?: string | null;
  dadosAntes?: any;
  dadosDepois?: any;
  ip?: string | null;
  userAgent?: string | null;
  criadoEm?: string;
}

export interface AuditoriaLogsListParams {
  categorias?: AuditoriaCategoria[] | AuditoriaCategoria | string[] | string;
  tipos?: string[] | string;
  atorId?: string;
  atorRole?: string;
  entidadeId?: string;
  entidadeTipo?: string;
  dataInicio?: string;
  dataFim?: string;
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  // Aliases legados para compatibilidade
  categoria?: AuditoriaCategoria | string;
  tipo?: string;
  usuarioId?: string;
  startDate?: string;
  endDate?: string;
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

export interface AuditoriaLogsListResponse extends AuditoriaPaginatedResponse<AuditoriaLog> {
  pagination: Pagination;
  resumo?: AuditoriaResumo;
  filtrosDisponiveis?: AuditoriaFiltrosDisponiveis;
}

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
  | "TAXA"
  | (string & {});

export type AuditoriaTransacaoStatus =
  | "PENDENTE"
  | "PROCESSANDO"
  | "APROVADA"
  | "RECUSADA"
  | "CANCELADA"
  | "ESTORNADA"
  | (string & {});

export interface AuditoriaTransacaoUsuario {
  id?: string | null;
  nome?: string | null;
  email?: string | null;
  codigo?: string | null;
}

export interface AuditoriaTransacaoEmpresa {
  id?: string | null;
  nomeExibicao?: string | null;
  codigo?: string | null;
}

export interface AuditoriaTransacaoContexto {
  cursoNome?: string | null;
  cursoId?: string | null;
  planoNome?: string | null;
  planoId?: string | null;
  origem?: string | null;
  metodoPagamento?: string | null;
}

export interface AuditoriaTransacoesFiltrosDisponiveis {
  tipos?: AuditoriaFiltroDisponivel[];
  status?: AuditoriaFiltroDisponivel[];
  gateways?: AuditoriaFiltroDisponivel[];
}

export interface AuditoriaTransacoesResumo {
  total?: number;
  valorTotal?: number;
  ultimoEventoEm?: string | null;
}

export interface AuditoriaTransacao {
  id: string;
  tipo: AuditoriaTransacaoTipo;
  status: AuditoriaTransacaoStatus;
  codigoExibicao?: string | null;
  tipoLabel?: string | null;
  statusLabel?: string | null;
  valor: number;
  moeda: string;
  valorFormatado?: string | null;
  usuarioId?: string | null;
  empresaId?: string | null;
  gateway?: string | null;
  gatewayId?: string | null;
  gatewayLabel?: string | null;
  gatewayReferencia?: string | null;
  descricao?: string | null;
  usuario?: AuditoriaTransacaoUsuario | null;
  empresa?: AuditoriaTransacaoEmpresa | null;
  contexto?: AuditoriaTransacaoContexto | null;
  meta?: Record<string, any> | null;
  dadosAdicionais?: any;
  criadoEm: string;
  atualizadoEm: string;
}

export interface AuditoriaTransacoesListParams {
  tipos?: AuditoriaTransacaoTipo[] | AuditoriaTransacaoTipo | string[] | string;
  status?: AuditoriaTransacaoStatus[] | AuditoriaTransacaoStatus | string[] | string;
  usuarioId?: string;
  empresaId?: string;
  gateway?: string;
  dataInicio?: string;
  dataFim?: string;
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: "criadoEm" | "tipo" | "status" | "valor" | "gateway" | string;
  sortDir?: "asc" | "desc";
  // Aliases legados para compatibilidade
  tipo?: AuditoriaTransacaoTipo | string;
  startDate?: string;
  endDate?: string;
}

export interface AuditoriaTransacoesListResponse
  extends AuditoriaPaginatedResponse<AuditoriaTransacao> {
  pagination: Pagination;
  resumo?: AuditoriaTransacoesResumo;
  filtrosDisponiveis?: AuditoriaTransacoesFiltrosDisponiveis;
}

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
