import type { AdminCompanyPremiumRemovalVacancyStatus } from "@/api/empresas/admin/types";

export const DEFAULT_APPLY_REASON = "Empresa propria da Advance";
export const DEFAULT_REMOVE_REASON = "Remocao administrativa";
export const DEFAULT_REMOVE_STATUS: AdminCompanyPremiumRemovalVacancyStatus =
  "RASCUNHO";

export const PREMIUM_REMOVE_STATUS_OPTIONS = [
  { label: "Voltar para rascunho", value: "RASCUNHO" },
  { label: "Encerrar vagas", value: "ENCERRADA" },
] as const;
