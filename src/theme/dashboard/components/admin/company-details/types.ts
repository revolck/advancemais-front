import type {
  AdminCompanyDetail,
  AdminCompanyPaymentLog,
  AdminCompanyVagaItem,
  AdminCompanyPlano,
  AdminCompanyPagamento,
  AdminCompanyAuditoriaItem,
  AdminCompanyConsolidatedResponse,
} from "@/api/empresas/admin/types";

export interface CompanyDetailsViewProps {
  company: AdminCompanyDetail;
  payments?: AdminCompanyPaymentLog[];
  bans?: any[]; // not directly used in view props; modals handle payloads
  vacancies?: AdminCompanyVagaItem[];
  auditoria?: AdminCompanyAuditoriaItem[];
  initialConsolidated: AdminCompanyConsolidatedResponse;
}

export interface AboutTabProps {
  company: AdminCompanyDetail;
  isLoading?: boolean;
}

export interface VacancyTabProps {
  vacancies: AdminCompanyVagaItem[];
  publishedVacancies: number;
  totalVacancies: number;
}

export interface PlanTabProps {
  isCompanyActive: boolean;
  plan: AdminCompanyPlano | null | undefined;
  payment: AdminCompanyPagamento | null | undefined;
  payments: AdminCompanyPaymentLog[];
  isLoading?: boolean;
}

export interface HistoryTabProps {
  auditoria: AdminCompanyAuditoriaItem[];
  isLoading?: boolean;
}
