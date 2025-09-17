export type AdminCompanyStatus = "ATIVO" | "INATIVO";

export type AdminCompanyPlanType =
  | "7_dias"
  | "15_dias"
  | "30_dias"
  | "60_dias"
  | "90_dias"
  | "120_dias"
  | "parceiro";

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
  parceira: boolean;
  diasTesteDisponibilizados?: number | null;
  plano?: AdminCompanyPlanSummary | null;
  vagas?: AdminCompanyVacancyInfo | null;
  pagamento?: AdminCompanyPaymentInfo | null;
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
}

export interface AdminCompanyPlanPayload {
  planoEmpresarialId: string;
  tipo: AdminCompanyPlanType;
  iniciarEm?: string;
  observacao?: string;
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
