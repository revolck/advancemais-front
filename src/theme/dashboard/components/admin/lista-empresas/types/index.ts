import type {
  AdminCompanyListItem,
  AdminCompanyPagination,
  AdminCompanyPlanType,
  AdminCompanyPaymentInfo,
  AdminCompanyBanInfo,
  AdminCompanyStatus,
  ListAdminCompaniesParams,
  ListAdminCompaniesResponse,
} from "@/api/empresas";

export type PartnershipType = AdminCompanyPlanType;

export type PlanFilter = "all" | string;

export interface Company {
  id: string;
  nome: string;
  avatarUrl?: string | null;
  cidade?: string | null;
  estado?: string | null;
  descricao?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
  codUsuario: string;
  cnpj?: string | null;
  ativo: boolean;
  status?: AdminCompanyStatus;
  criadoEm?: string | null;
  parceira?: boolean;
  diasTesteDisponibilizados?: number | null;
  banida?: boolean;
  banimentoAtivo?: AdminCompanyBanInfo | null;
}

export interface Plan {
  id: string;
  icon?: string | null;
  nome: string;
  descricao?: string | null;
  valor?: string | null;
  desconto?: number | null;
  quantidadeVagas: number;
  vagaEmDestaque?: boolean | null;
  quantidadeVagasDestaque?: number | null;
  criadoEm?: string | null;
  atualizadoEm?: string | null;
  vagasPublicadas?: number | null;
  tipo?: PartnershipType;
  inicio?: string | null;
  fim?: string | null;
  modeloPagamento?: string | null;
  metodoPagamento?: string | null;
  statusPagamento?: string | null;
  duracaoEmDias?: number | null;
  diasRestantes?: number | null;
}

export interface Partnership {
  id: string;
  tipo?: PartnershipType;
  inicio?: string | null;
  fim?: string | null;
  ativo?: boolean;
  empresa: Company;
  plano: Plan;
  raw?: AdminCompanyListItem;
  pagamento?: AdminCompanyPaymentInfo | null;
}

export interface CompanyDashboardProps {
  className?: string;
  partnerships?: Partnership[];
  fetchFromApi?: boolean;
  itemsPerPage?: number;
  pageSize?: number;
  onDataLoaded?: (data: Partnership[], response?: ListAdminCompaniesResponse | null) => void;
  onError?: (message: string) => void;
}

export interface CompanyDashboardMetrics {
  partners: number;
  trials: number;
  active: number;
  inactive: number;
}

export interface UseCompanyDashboardDataOptions {
  enabled?: boolean;
  pageSize?: number;
  initialData?: Partnership[];
  initialParams?: ListAdminCompaniesParams;
  onSuccess?: (data: Partnership[], response: ListAdminCompaniesResponse) => void;
  onError?: (message: string) => void;
  autoFetch?: boolean;
}

export interface UseCompanyDashboardDataReturn {
  partnerships: Partnership[];
  pagination: AdminCompanyPagination | null;
  isLoading: boolean;
  error: string | null;
  refetch: (params?: Partial<ListAdminCompaniesParams>) => Promise<Partnership[]>;
}
