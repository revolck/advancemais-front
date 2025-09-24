import type { AdminCompanyPagination } from "@/api/empresas";
import type { PartnershipType } from "../types";

export const COMPANY_DASHBOARD_CONFIG = {
  defaultPageSize: 20,
  pageSizeOptions: [20, 30, 50] as const,
  api: {
    defaultPageSize: 20,
    timeout: 15000,
  },
};

export const TRIAL_PARTNERSHIP_TYPES: PartnershipType[] = [
  "teste",
  "parceiro",
  "ASSINATURA",
];

export const DEFAULT_COMPANY_PAGINATION: AdminCompanyPagination = {
  page: 1,
  pageSize: COMPANY_DASHBOARD_CONFIG.api.defaultPageSize,
  total: 0,
  totalPages: 0,
};
