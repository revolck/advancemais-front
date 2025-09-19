export type AdminCompanyStatus = "ATIVO" | "INATIVO";

export type AdminCompanyPlanType =
  | "7_dias"
  | "15_dias"
  | "30_dias"
  | "60_dias"
  | "90_dias"
  | "120_dias"
  | "parceiro";

export type AdminCompanyVacancyStatus =
  | "RASCUNHO"
  | "EM_ANALISE"
  | "PUBLICADO"
  | "EXPIRADO"
  | string;

export interface AdminCompanyPlanSummary {
  id: string;
  nome: string;
  tipo: AdminCompanyPlanType;
  inicio?: string | null;
  fim?: string | null;
  modeloPagamento?: string | null;
  metodoPagamento?: string | null;
  statusPagamento?: string | null;
  quantidadeVagas: number;
  valor?: string | null;
  duracaoEmDias?: number | null;
  diasRestantes?: number | null;
  vagasPublicadas?: number | null;
}

export interface AdminCompanyVacancyInfo {
  publicadas?: number | null;
  limitePlano?: number | null;
}

export interface AdminCompanyPaymentInfo {
  modelo?: string | null;
  metodo?: string | null;
  status?: string | null;
  ultimoPagamentoEm?: string | null;
}

export interface AdminCompanyBanInfo {
  id: string;
  motivo: string;
  dias: number;
  inicio: string;
  fim: string;
  criadoEm: string;
}

export interface AdminCompanyListItem {
  id: string;
  codUsuario: string;
  nome: string;
  avatarUrl?: string | null;
  cnpj?: string | null;
  email?: string | null;
  telefone?: string | null;
  descricao?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
  cidade?: string | null;
  estado?: string | null;
  criadoEm?: string | null;
  ativa: boolean;
  status?: AdminCompanyStatus;
  parceira: boolean;
  diasTesteDisponibilizados?: number | null;
  plano?: AdminCompanyPlanSummary | null;
  vagas?: AdminCompanyVacancyInfo | null;
  pagamento?: AdminCompanyPaymentInfo | null;
  banida?: boolean;
  banimentoAtivo?: AdminCompanyBanInfo | null;
  vagasPublicadas?: number | null;
  limiteVagasPlano?: number | null;
}

export type AdminCompanyDetail = AdminCompanyListItem;

export interface AdminCompanyDetailResponse {
  empresa: AdminCompanyDetail;
}

export interface AdminCompanyPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ListAdminCompaniesResponse {
  data: AdminCompanyListItem[];
  pagination: AdminCompanyPagination;
}

export interface ListAdminCompaniesParams {
  page?: number;
  pageSize?: number;
  search?: string;
  // optional filters (backend may ignore unknown params)
  planNames?: string[]; // by plan.nome
  planTypes?: AdminCompanyPlanType[]; // e.g., "parceiro", "30_dias", etc.
}

export interface AdminCompanyPlanPayload {
  planoEmpresarialId: string;
  tipo: AdminCompanyPlanType;
  iniciarEm?: string;
  observacao?: string;
  resetPeriodo?: boolean;
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
  instagram?: string;
  linkedin?: string;
  avatarUrl?: string;
  aceitarTermos: boolean;
  status: AdminCompanyStatus;
  plano?: AdminCompanyPlanPayload;
}

export interface UpdateAdminCompanyPayload {
  nome?: string;
  email?: string;
  telefone?: string;
  cnpj?: string;
  cidade?: string;
  estado?: string;
  descricao?: string;
  instagram?: string;
  linkedin?: string;
  avatarUrl?: string;
  status?: AdminCompanyStatus;
  plano?: AdminCompanyPlanPayload;
}

export interface ListAdminCompanyPaymentsParams {
  page?: number;
  pageSize?: number;
}

export interface ListAdminCompanyBansParams {
  page?: number;
  pageSize?: number;
}

export interface CreateAdminCompanyBanPayload {
  dias: number;
  motivo: string;
}

export interface AdminCompanyPaymentLog {
  id: string;
  tipo: string;
  status: string;
  mensagem?: string | null;
  externalRef?: string | null;
  mpResourceId?: string | null;
  criadoEm?: string | null;
  plano?: {
    id: string;
    nome?: string | null;
  } | null;
}

export interface AdminCompanyPaymentHistoryResponse {
  data: AdminCompanyPaymentLog[];
  pagination: AdminCompanyPagination;
}

export interface AdminCompanyBanHistoryResponse {
  data: AdminCompanyBanInfo[];
  pagination: AdminCompanyPagination;
}

export interface AdminCompanyBanDetailResponse {
  banimento: AdminCompanyBanInfo;
}

export interface ListAdminCompanyVacanciesParams {
  page?: number;
  pageSize?: number;
  status?: AdminCompanyVacancyStatus[] | AdminCompanyVacancyStatus | string;
}

export interface AdminCompanyVacancyListItem {
  id: string;
  status: AdminCompanyVacancyStatus;
  inseridaEm?: string | null;
  atualizadoEm?: string | null;
  inscricoesAte?: string | null;
  modoAnonimo?: boolean | null;
  modalidade?: string | null;
  regimeDeTrabalho?: string | null;
  paraPcd?: boolean | null;
  codigo?: string | null;
  titulo?: string | null;
  nome?: string | null;
  descricao?: string | null;
  descricaoExibicao?: string | null;
  atividades?: string | null;
  beneficios?: string | null;
  observacoes?: string | null;
  requisitos?: string | null;
  cargaHoraria?: string | null;
  nomeExibicao?: string | null;
  logoExibicao?: string | null;
  mensagemAnonimato?: string | null;
  empresa?: {
    id: string;
    nome?: string | null;
    avatarUrl?: string | null;
    cidade?: string | null;
    estado?: string | null;
    codUsuario?: string | null;
  } | null;
  candidatos?: number | null;
  totalCandidatos?: number | null;
  inscritos?: number | null;
  inscricoes?: number | null;
  totalInscricoes?: number | null;
}

export interface AdminCompanyVacancyListResponse {
  data: AdminCompanyVacancyListItem[];
  pagination: AdminCompanyPagination;
}

export interface AdminCompanyVacancyDetailResponse {
  vaga: AdminCompanyVacancyListItem;
}
