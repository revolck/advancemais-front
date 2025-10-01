// ============================================================================
// TIPOS BASE
// ============================================================================

export type AdminCompanyStatus =
  | "ATIVO"
  | "INATIVO"
  | "BLOQUEADO"
  | "PENDENTE"
  | "SUSPENSO";

export type AdminCompanyPlanMode = "CLIENTE" | "TESTE" | "PARCEIRO";

export type AdminCompanyPaymentModel =
  | "ASSINATURA"
  | "PAGAMENTO_UNICO"
  | "PAGAMENTO_PARCELADO";

export type AdminCompanyPaymentMethod =
  | "PIX"
  | "CARTAO_CREDITO"
  | "CARTAO_DEBITO"
  | "BOLETO"
  | "TRANSFERENCIA"
  | "DINHEIRO";

export type AdminCompanyPaymentStatus =
  | "PENDENTE"
  | "EM_PROCESSAMENTO"
  | "APROVADO"
  | "CONCLUIDO"
  | "RECUSADO"
  | "ESTORNADO"
  | "CANCELADO";

export type AdminCompanyVacancyStatus =
  | "RASCUNHO"
  | "EM_ANALISE"
  | "PUBLICADO"
  | "DESPUBLICADA"
  | "PAUSADA"
  | "ENCERRADA"
  | "EXPIRADO";

// ============================================================================
// TIPOS DE ENDEREÇO
// ============================================================================

export interface AdminCompanyEndereco {
  id: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

// ============================================================================
// TIPOS DE PLANO
// ============================================================================

export interface AdminCompanyPlano {
  id: string;
  planosEmpresariaisId?: string;
  nome: string;
  modo: AdminCompanyPlanMode;
  status: AdminCompanyStatus;
  inicio: string;
  fim: string | null;
  modeloPagamento: AdminCompanyPaymentModel;
  metodoPagamento: AdminCompanyPaymentMethod;
  statusPagamento: AdminCompanyPaymentStatus;
  valor: string;
  quantidadeVagas: number;
  duracaoEmDias: number | null;
  diasRestantes: number;
}

// ============================================================================
// TIPOS DE INFORMAÇÕES
// ============================================================================

export interface AdminCompanyInformacoes {
  telefone: string;
  descricao: string;
  avatarUrl: string;
  aceitarTermos: boolean;
}

export interface AdminCompanySocialLinks {
  linkedin?: string;
  instagram?: string;
}

// ============================================================================
// TIPOS DE VAGAS
// ============================================================================

export interface AdminCompanyVagas {
  publicadas: number;
  limitePlano: number;
}

// ============================================================================
// TIPOS DE PAGAMENTO
// ============================================================================

export interface AdminCompanyPagamento {
  modelo: AdminCompanyPaymentModel;
  metodo: AdminCompanyPaymentMethod;
  status: AdminCompanyPaymentStatus;
  ultimoPagamentoEm: string;
}

// ============================================================================
// TIPOS DE BANIMENTO
// ============================================================================

export interface AdminCompanyBanimento {
  tipo: BanType;
  motivo: BanReason;
  status: BanStatus;
  inicio: string;
  fim: string;
  observacoes: string;
}

export interface AdminCompanyBanAlvo {
  tipo: "EMPRESA";
  id: string;
  nome: string;
  role: "EMPRESA";
}

export interface AdminCompanyBanAplicadoPor {
  id: string;
  nome: string;
  role: "ADMIN" | "MODERADOR";
}

export interface AdminCompanyBanAuditoria {
  criadoEm: string;
  atualizadoEm: string;
}

export interface AdminCompanyBanItem {
  id: string;
  alvo: AdminCompanyBanAlvo;
  banimento: AdminCompanyBanimento;
  aplicadoPor: AdminCompanyBanAplicadoPor;
  auditoria: AdminCompanyBanAuditoria;
}

// ============================================================================
// TIPOS DE PAGINAÇÃO
// ============================================================================

export interface AdminCompanyPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// ============================================================================
// TIPOS DE EMPRESA
// ============================================================================

export interface AdminCompanyDashboardItem {
  id: string;
  codUsuario: string;
  nome: string;
  email: string;
  telefone: string;
  avatarUrl: string;
  cnpj: string;
  status: AdminCompanyStatus;
  criadoEm: string;
  vagasPublicadas: number;
  limiteVagasPlano: number;
  plano: AdminCompanyPlano;
}

export interface AdminCompanyListItem {
  id: string;
  codUsuario: string;
  nome: string;
  email: string;
  telefone: string;
  avatarUrl: string;
  cnpj: string;
  cidade: string;
  estado: string;
  enderecos: AdminCompanyEndereco[];
  criadoEm: string;
  informacoes: AdminCompanyInformacoes;
  ativa: boolean;
  parceira: boolean;
  diasTesteDisponibilizados: number;
  plano: AdminCompanyPlano;
  vagasPublicadas: number;
  limiteVagasPlano: number;
  banida: boolean;
  banimentoAtivo: AdminCompanyBanItem | null;
  bloqueada: boolean;
  bloqueioAtivo: AdminCompanyBanItem | null;
}

export interface AdminCompanyDetail {
  id: string;
  codUsuario: string;
  nome: string;
  email: string;
  telefone: string;
  avatarUrl: string;
  cnpj: string;
  descricao: string;
  socialLinks: AdminCompanySocialLinks;
  cidade: string;
  estado: string;
  enderecos: AdminCompanyEndereco[];
  criadoEm: string;
  status: AdminCompanyStatus;
  ultimoLogin: string;
  ativa: boolean;
  parceira: boolean;
  diasTesteDisponibilizados: number;
  plano: AdminCompanyPlano;
  vagas: AdminCompanyVagas;
  pagamento: AdminCompanyPagamento;
  banida: boolean;
  banimentoAtivo: AdminCompanyBanItem | null;
  bloqueada: boolean;
  bloqueioAtivo: AdminCompanyBanItem | null;
  informacoes: AdminCompanyInformacoes;
}

// ============================================================================
// TIPOS DE VAGA
// ============================================================================

export interface AdminCompanyVagaItem {
  id: string;
  codigo: string;
  titulo: string;
  status: AdminCompanyVacancyStatus;
  inseridaEm: string;
  atualizadoEm: string;
  inscricoesAte?: string;
  modoAnonimo?: boolean;
  descricao?: string;
  localizacao?: {
    cidade: string;
    estado: string;
    formato?: string;
    logradouro?: string;
    numero?: string;
    bairro?: string;
    cep?: string;
    complemento?: string;
    referencia?: string;
  };
  requisitos?: {
    obrigatorios: string[];
    desejaveis: string[];
  };
  atividades?: {
    principais: string[];
    extras: string[];
  };
  beneficios?: {
    lista: string[];
    observacoes?: string;
  };
  modalidade?: string;
  regimeDeTrabalho?: string;
  jornada?: string;
  senioridade?: string;
  paraPcd?: boolean;
  vagaEmDestaque?: boolean;
  salarioConfidencial?: boolean;
  salarioMin?: string;
  salarioMax?: string;
  numeroVagas?: number;
  maxCandidaturasPorUsuario?: number;
  observacoes?: string;
  candidaturasResumo?: {
    total: number;
    porStatus: Record<string, number>;
  };
  candidaturas?: AdminCompanyCandidatura[];
}

export interface AdminCompanyCandidatura {
  id: string;
  vagaId: string;
  candidatoId: string;
  curriculoId: string;
  empresaUsuarioId: string;
  status: string;
  origem: string;
  aplicadaEm: string;
  atualizadaEm: string;
  consentimentos: {
    newsletter: boolean;
  };
  candidato: {
    id: string;
    codUsuario: string;
    nomeCompleto: string;
    email: string;
    cpf: string;
    cnpj?: string;
    role: string;
    tipoUsuario: string;
    status: string;
    criadoEm: string;
    ultimoLogin: string;
    telefone?: string;
    genero?: string;
    dataNasc?: string;
    inscricao?: string;
    avatarUrl?: string;
    descricao?: string;
    aceitarTermos: boolean;
    cidade?: string;
    estado?: string;
    enderecos: any[];
    socialLinks?: any;
    informacoes: {
      telefone?: string;
      genero?: string;
      dataNasc?: string;
      inscricao?: string;
      avatarUrl?: string;
      descricao?: string;
      aceitarTermos: boolean;
    };
  };
  curriculo: {
    id: string;
    usuarioId: string;
    titulo: string;
    resumo: string;
    objetivo: string;
    principal: boolean;
    areasInteresse: string[];
    preferencias: {
      local: string;
      regime: string;
    };
    habilidades: string[];
    idiomas: string[];
    experiencias: Array<{
      cargo: string;
      empresa: string;
      periodo: string;
    }>;
    formacao: Array<{
      curso: string;
      instituicao: string;
    }>;
    cursosCertificacoes?: any;
    premiosPublicacoes?: any;
    acessibilidade?: any;
    consentimentos?: any;
    ultimaAtualizacao: string;
    criadoEm: string;
    atualizadoEm: string;
  };
}

// ============================================================================
// TIPOS DE PAGAMENTO
// ============================================================================

export interface AdminCompanyPaymentLog {
  id: string;
  tipo: string;
  status: string;
  mensagem: string;
  criadoEm: string;
}

// ============================================================================
// TIPOS DE RESPOSTA
// ============================================================================

export interface AdminCompanyDashboardResponse {
  data: AdminCompanyDashboardItem[];
  pagination: AdminCompanyPagination;
}

export interface AdminCompanyListResponse {
  data: AdminCompanyListItem[];
  pagination: AdminCompanyPagination;
}

export interface AdminCompanyDetailResponse {
  empresa: AdminCompanyDetail;
}

export interface AdminCompanyPaymentHistoryResponse {
  data: AdminCompanyPaymentLog[];
  pagination: AdminCompanyPagination;
}

export interface AdminCompanyBanHistoryResponse {
  data: AdminCompanyBanItem[];
  pagination: AdminCompanyPagination;
}

export interface AdminCompanyBanDetailResponse {
  banimento: AdminCompanyBanItem;
}

export interface AdminCompanyVagaListResponse {
  data: AdminCompanyVagaItem[];
  pagination: AdminCompanyPagination;
}

export interface AdminCompanyVagaDetailResponse {
  vaga: AdminCompanyVagaItem;
}

// ============================================================================
// TIPOS DE PARÂMETROS
// ============================================================================

export interface AdminCompanyDashboardParams {
  page?: number;
  search?: string;
}

export interface AdminCompanyListParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface AdminCompanyPaymentParams {
  page?: number;
  pageSize?: number;
}

// ============================================================================
// TIPOS DE BLOQUEIO DE USUÁRIOS
// ============================================================================

export type BanType = "TEMPORARIO" | "PERMANENTE";
export type BanReason =
  | "SPAM"
  | "VIOLACAO_POLITICAS"
  | "FRAUDE"
  | "ABUSO_DE_RECURSOS"
  | "OUTROS";
export type BanStatus = "ATIVO" | "REVOGADO" | "EXPIRADO";

export interface BanTarget {
  tipo: "EMPRESA";
  id: string;
  nome: string;
  role: "EMPRESA";
}

export interface BanDetails {
  tipo: BanType;
  motivo: BanReason;
  status: BanStatus;
  inicio: string;
  fim: string | null;
  observacoes: string;
}

export interface BanAppliedBy {
  id: string;
  nome: string;
  role: "ADMIN" | "MODERADOR";
}

export interface BanAudit {
  criadoEm: string;
  atualizadoEm: string;
}

export interface BanItem {
  id: string;
  alvo: BanTarget;
  bloqueio: BanDetails;
  aplicadoPor: BanAppliedBy;
  auditoria: BanAudit;
}

export interface BanListResponse {
  data: BanItem[];
  pagination: AdminCompanyPagination;
}

export interface CreateBanPayload {
  tipo: BanType;
  motivo: BanReason;
  dias?: number; // Apenas para bloqueios temporários
  observacoes: string;
}

export interface RevokeBanPayload {
  observacoes: string;
}

export interface BanResponse {
  bloqueio: BanItem;
}

export interface AdminCompanyBanParams {
  page?: number;
  pageSize?: number;
}

export interface AdminCompanyVagaParams {
  status?: string;
  page?: number;
  pageSize?: number;
}

// ============================================================================
// TIPOS DE PAYLOAD
// ============================================================================

export interface AdminCompanyPlanoPayload {
  planosEmpresariaisId: string;
  modo: AdminCompanyPlanMode;
  diasTeste?: number;
  resetPeriodo?: boolean;
}

export interface UpdateAdminCompanyPlanoPayload {
  planosEmpresariaisId: string;
  modo: AdminCompanyPlanMode;
  iniciarEm?: string;
  diasTeste?: number;
  modeloPagamento?: AdminCompanyPaymentModel;
  metodoPagamento?: AdminCompanyPaymentMethod;
  statusPagamento?: AdminCompanyPaymentStatus;
  proximaCobranca?: string;
}

export interface CreateAdminCompanyPlanoPayload {
  planosEmpresariaisId: string;
  modo: AdminCompanyPlanMode;
  iniciarEm: string;
  diasTeste?: number;
  modeloPagamento?: AdminCompanyPaymentModel | null;
  metodoPagamento?: AdminCompanyPaymentMethod | null;
  statusPagamento?: AdminCompanyPaymentStatus | null;
  proximaCobranca?: string | null;
  graceUntil?: string | null;
}

export interface CreateAdminCompanyPayload {
  nome: string;
  email: string;
  telefone: string;
  senha: string;
  supabaseId: string;
  cnpj: string;
  cidade: string;
  estado: string;
  descricao?: string;
  aceitarTermos: boolean;
  plano?: AdminCompanyPlanoPayload;
}

export interface UpdateAdminCompanyPayload {
  telefone?: string;
  descricao?: string;
  status?: AdminCompanyStatus;
  plano?: AdminCompanyPlanoPayload;
  enderecos?: AdminCompanyEndereco[];
  cidade?: string;
  estado?: string;
  senha?: string;
  confirmarSenha?: string;
}

export interface CreateAdminCompanyBanPayload {
  tipo: BanType;
  motivo: BanReason;
  dias?: number;
  observacoes: string;
}

export interface RevokeAdminCompanyBanPayload {
  observacoes?: string;
}

// ============================================================================
// TIPOS DE ERRO
// ============================================================================

export interface AdminCompanyErrorResponse {
  success: false;
  code: string;
  message: string;
  issues?: Record<string, string[]>;
  error?: string;
}

export interface AdminCompanyValidationError extends AdminCompanyErrorResponse {
  code: "VALIDATION_ERROR";
}

export interface AdminCompanyNotFoundError extends AdminCompanyErrorResponse {
  code: "NOT_FOUND";
}

export interface AdminCompanyDuplicateError extends AdminCompanyErrorResponse {
  code: "DUPLICATE_ERROR";
}

export interface AdminCompanyBanNotFoundError
  extends AdminCompanyErrorResponse {
  code: "BANIMENTO_NOT_FOUND";
}

// ============================================================================
// TIPOS DE RESPOSTA DA API
// ============================================================================

export type AdminCompanyDashboardApiResponse =
  | AdminCompanyDashboardResponse
  | AdminCompanyErrorResponse;

export type AdminCompanyListApiResponse =
  | AdminCompanyListResponse
  | AdminCompanyErrorResponse;

export type AdminCompanyDetailApiResponse =
  | AdminCompanyDetailResponse
  | AdminCompanyErrorResponse;

export type AdminCompanyCreateApiResponse =
  | AdminCompanyDetailResponse
  | AdminCompanyValidationError
  | AdminCompanyDuplicateError;

export type AdminCompanyUpdateApiResponse =
  | AdminCompanyDetailResponse
  | AdminCompanyValidationError
  | AdminCompanyNotFoundError
  | AdminCompanyDuplicateError;

export type AdminCompanyPaymentHistoryApiResponse =
  | AdminCompanyPaymentHistoryResponse
  | AdminCompanyErrorResponse;

export type AdminCompanyBanHistoryApiResponse =
  | AdminCompanyBanHistoryResponse
  | AdminCompanyErrorResponse;

export type AdminCompanyBanCreateApiResponse =
  | AdminCompanyBanDetailResponse
  | AdminCompanyValidationError
  | AdminCompanyNotFoundError;

export type AdminCompanyBanRevokeApiResponse =
  | void
  | AdminCompanyValidationError
  | AdminCompanyNotFoundError
  | AdminCompanyBanNotFoundError;

export type AdminCompanyVagaListApiResponse =
  | AdminCompanyVagaListResponse
  | AdminCompanyErrorResponse;

export type AdminCompanyVagaApproveApiResponse =
  | AdminCompanyVagaDetailResponse
  | AdminCompanyValidationError
  | AdminCompanyNotFoundError;
