"use client";

import type {
  PopupLeadOpportunity,
  PopupLeadOpportunityStatus,
} from "@/api/websites/components/popups";

export interface PopupLeadOpportunityFormValues {
  titulo: string;
  status: PopupLeadOpportunityStatus;
  valorEsperado: string;
  closeDate: string;
  descricao: string;
  ownerUsuarioId: string | null;
}

export const POPUP_LEAD_OPPORTUNITY_STATUS_OPTIONS: Array<{
  value: PopupLeadOpportunityStatus;
  label: string;
}> = [
  { value: "ABERTA", label: "Aberta" },
  { value: "EM_ANDAMENTO", label: "Em andamento" },
  { value: "GANHA", label: "Ganha" },
  { value: "PERDIDA", label: "Perdida" },
];

export function createDefaultPopupLeadOpportunityFormValues(
  ownerUsuarioId: string | null = null,
): PopupLeadOpportunityFormValues {
  return {
    titulo: "",
    status: "ABERTA",
    valorEsperado: "",
    closeDate: "",
    descricao: "",
    ownerUsuarioId,
  };
}

export function mapOpportunityToFormValues(
  opportunity: PopupLeadOpportunity,
): PopupLeadOpportunityFormValues {
  return {
    titulo: opportunity.titulo,
    status: opportunity.status,
    valorEsperado:
      opportunity.valorEsperado !== null &&
      opportunity.valorEsperado !== undefined
        ? String(opportunity.valorEsperado)
        : "",
    closeDate: opportunity.closeDate?.slice(0, 10) ?? "",
    descricao: opportunity.descricao ?? "",
    ownerUsuarioId: opportunity.owner?.id ?? null,
  };
}

export function getPopupLeadOpportunityStatusLabel(
  status: PopupLeadOpportunityStatus,
) {
  return (
    POPUP_LEAD_OPPORTUNITY_STATUS_OPTIONS.find((item) => item.value === status)
      ?.label ?? status
  );
}

export function getPopupLeadOpportunityStatusBadgeClass(
  status: PopupLeadOpportunityStatus,
) {
  if (status === "GANHA") {
    return "bg-green-100 text-green-700 border-green-200";
  }

  if (status === "PERDIDA") {
    return "bg-red-100 text-red-700 border-red-200";
  }

  if (status === "EM_ANDAMENTO") {
    return "bg-amber-100 text-amber-700 border-amber-200";
  }

  return "bg-blue-100 text-blue-700 border-blue-200";
}

export function formatPopupLeadOpportunityDate(value?: string | null) {
  if (!value) return "—";

  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function formatPopupLeadOpportunityCurrency(
  value?: string | number | null,
) {
  if (value === null || value === undefined || value === "") return "—";

  const numberValue =
    typeof value === "number" ? value : Number(String(value).replace(",", "."));

  if (Number.isNaN(numberValue)) {
    return String(value);
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numberValue);
}
