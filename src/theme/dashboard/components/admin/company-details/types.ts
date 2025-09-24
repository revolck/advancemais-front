import type {
  AdminCompanyDetail,
  AdminCompanyPaymentLog,
  AdminCompanyVagaItem,
  AdminCompanyPlano,
  AdminCompanyPagamento,
} from "@/api/empresas/admin/types";

export interface CompanyDetailsViewProps {
  company: AdminCompanyDetail;
  payments?: AdminCompanyPaymentLog[];
  bans?: any[]; // not directly used in view props; modals handle payloads
  vacancies?: AdminCompanyVagaItem[];
}

export interface AboutTabProps {
  company: AdminCompanyDetail;
}

export interface VacancyTabProps {
  vacancies: AdminCompanyVagaItem[];
  publishedVacancies: number;
  totalVacancies: number;
  onViewVacancy: (vacancy: AdminCompanyVagaItem) => void;
  onEditVacancy: (vacancy: AdminCompanyVagaItem) => void;
}

export interface PlanTabProps {
  isCompanyActive: boolean;
  plan: AdminCompanyPlano | null | undefined;
  payment: AdminCompanyPagamento | null | undefined;
  payments: AdminCompanyPaymentLog[];
}
