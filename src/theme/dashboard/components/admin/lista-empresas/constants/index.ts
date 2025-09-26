import type { AdminCompanyPagination } from "@/api/empresas";
import type { PartnershipType } from "../types";

export const COMPANY_DASHBOARD_CONFIG = {
  defaultPageSize: 10,
  pageSizeOptions: [10] as const,
  api: {
    defaultPageSize: 10,
    timeout: 15000,
  },
};

export const TRIAL_PARTNERSHIP_TYPES: PartnershipType[] = [
  "TESTE",
  "PARCEIRO",
  "CLIENTE",
];

export const DEFAULT_COMPANY_PAGINATION: AdminCompanyPagination = {
  page: 1,
  pageSize: COMPANY_DASHBOARD_CONFIG.api.defaultPageSize,
  total: 0,
  totalPages: 0,
};
