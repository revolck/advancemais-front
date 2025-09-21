import type {
  AdminCompanyDetail,
  AdminCompanyPaymentLog,
  AdminCompanyVacancyListItem,
  AdminCompanyPlanSummary,
  AdminCompanyPaymentInfo,
} from "@/api/empresas/admin/types";

export interface CompanyDetailsViewProps {
  company: AdminCompanyDetail;
  payments?: AdminCompanyPaymentLog[];
  bans?: any[]; // not directly used in view props; modals handle payloads
  vacancies?: AdminCompanyVacancyListItem[];
}

export interface AboutTabProps {
  company: AdminCompanyDetail;
}

export interface VacancyTabProps {
  vacancies: AdminCompanyVacancyListItem[];
  publishedVacancies: number;
  totalVacancies: number;
  onViewVacancy: (vacancy: AdminCompanyVacancyListItem) => void;
  onEditVacancy: (vacancy: AdminCompanyVacancyListItem) => void;
}

export interface PlanTabProps {
  isCompanyActive: boolean;
  plan: AdminCompanyPlanSummary | null | undefined;
  payment: AdminCompanyPaymentInfo | null | undefined;
  payments: AdminCompanyPaymentLog[];
}

