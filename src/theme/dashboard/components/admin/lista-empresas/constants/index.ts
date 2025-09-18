import type { AdminCompanyPagination } from "@/api/empresas";
import type { PartnershipType } from "../types";

export const COMPANY_DASHBOARD_CONFIG = {
  itemsPerPage: 25,
  api: {
    pageSize: 100,
    timeout: 15000,
  },
};

export const TRIAL_PARTNERSHIP_TYPES: PartnershipType[] = [
  "7_dias",
  "15_dias",
  "30_dias",
  "60_dias",
  "90_dias",
  "120_dias",
];

export const DEFAULT_COMPANY_PAGINATION: AdminCompanyPagination = {
  page: 1,
  pageSize: COMPANY_DASHBOARD_CONFIG.api.pageSize,
  total: 0,
  totalPages: 0,
};
