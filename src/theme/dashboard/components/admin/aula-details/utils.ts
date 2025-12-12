import { Video, Building2, Radio, RotateCcw } from "lucide-react";
import type { Modalidade, AulaStatus } from "@/api/aulas";

export function getModalidadeIcon(modalidade?: Modalidade) {
  if (!modalidade) return Video;

  const normalized = modalidade.toUpperCase();

  switch (normalized) {
    case "ONLINE":
      return Video;
    case "PRESENCIAL":
      return Building2;
    case "AO_VIVO":
      return Radio;
    case "SEMIPRESENCIAL":
      return RotateCcw;
    default:
      return Video;
  }
}

export function getModalidadeBadgeColor(modalidade?: Modalidade) {
  if (!modalidade) return "bg-gray-100 text-gray-800 border-gray-200";

  const normalized = modalidade.toUpperCase();

  switch (normalized) {
    case "ONLINE":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "PRESENCIAL":
      return "bg-green-100 text-green-800 border-green-200";
    case "AO_VIVO":
      return "bg-red-100 text-red-800 border-red-200";
    case "SEMIPRESENCIAL":
      return "bg-purple-100 text-purple-800 border-purple-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

export function getStatusBadgeColor(status?: AulaStatus) {
  if (!status) return "bg-gray-100 text-gray-800 border-gray-200";

  const normalized = status.toUpperCase().replace(/_/g, "");

  switch (normalized) {
    case "RASCUNHO":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "PUBLICADA":
      return "bg-green-100 text-green-800 border-green-200";
    case "EMANDAMENTO":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "CONCLUIDA":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "CANCELADA":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

export function formatAulaStatus(status?: AulaStatus) {
  if (!status) return "—";

  const normalized = status.toUpperCase().replace(/_/g, "_");

  const statusMap: Record<string, string> = {
    RASCUNHO: "Rascunho",
    PUBLICADA: "Publicada",
    EM_ANDAMENTO: "Em Andamento",
    CONCLUIDA: "Concluída",
    CANCELADA: "Cancelada",
  };

  if (statusMap[normalized]) {
    return statusMap[normalized];
  }

  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatDate(dateString?: string) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatTime(dateString?: string) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTime(dateString?: string) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

