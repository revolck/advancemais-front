import type {
  AdminCompanyDetail,
  AdminCompanyPremiumRemovalVacancyStatus,
} from "@/api/empresas/admin/types";

export interface RecursosPremiumVagasModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  company: AdminCompanyDetail;
}

export interface PremiumResourcesNoticeProps {
  isActive: boolean;
}

export interface PremiumResourcesReasonFieldProps {
  motivo: string;
  isSubmitting: boolean;
  onChange: (value: string) => void;
}

export interface PremiumResourcesStatusFieldProps {
  novoStatus: AdminCompanyPremiumRemovalVacancyStatus;
  isSubmitting: boolean;
  onChange: (value: string | null) => void;
}

export interface PremiumResourcesFooterProps {
  isActive: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}
