import type * as CandidatoTypes from "@/api/candidatos/types";
export type { CandidatoOverview, CandidaturaStatus } from "@/api/candidatos/types";

import type { CandidaturaStatus } from "@/api/candidatos/types";

export interface CandidatoDashboardFilters {
  search?: string;
  vagaId?: string;
  empresaUsuarioId?: string;
  page?: number;
  pageSize?: number;
  onlyWithCandidaturas?: boolean;
  status?: CandidaturaStatus[];
  criadoDe?: string;
  criadoAte?: string;
}

export interface CandidatoDashboardData {
  candidatos: CandidatoTypes.CandidatoOverview[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  summary: {
    candidatos: number;
    curriculos: number;
    candidaturas: number;
  };
  filters: {
    scope: string;
    empresaUsuarioId?: string;
    vagaId?: string;
    search?: string;
    onlyWithCandidaturas?: boolean;
    criadoDe?: string;
    criadoAte?: string;
    viewerRole: string;
  };
}

export interface CandidatoRowProps {
  candidato: CandidatoTypes.CandidatoOverview;
  onViewDetails: (candidato: CandidatoTypes.CandidatoOverview) => void;
}

export type CandidatoSortField = "name" | null;
export type CandidatoSortDirection = "asc" | "desc";

export interface CandidatoTableProps {
  candidatos: CandidatoTypes.CandidatoOverview[];
  isLoading: boolean;
  onViewDetails: (candidato: CandidatoTypes.CandidatoOverview) => void;
  sortField: CandidatoSortField;
  sortDirection: CandidatoSortDirection;
  onToggleSortName: () => void;
  onSetSortName: (direction: CandidatoSortDirection) => void;
}

export interface CandidatoDashboardProps {
  className?: string;
  initialData?: CandidatoDashboardData;
  filters?: CandidatoDashboardFilters;
}

export interface StatusOption {
  value: string;
  label: string;
  color: string;
}

export const CANDIDATURA_STATUS_OPTIONS: StatusOption[] = [
  {
    value: "RECEBIDA",
    label: "Recebida",
    color: "bg-blue-100 text-blue-800 border border-blue-200",
  },
  {
    value: "EM_ANALISE",
    label: "Em Análise",
    color: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  },
  {
    value: "EM_TRIAGEM",
    label: "Em Triagem",
    color: "bg-orange-100 text-orange-800 border border-orange-200",
  },
  {
    value: "ENTREVISTA",
    label: "Entrevista",
    color: "bg-purple-100 text-purple-800 border border-purple-200",
  },
  {
    value: "DESAFIO",
    label: "Desafio",
    color: "bg-indigo-100 text-indigo-800 border border-indigo-200",
  },
  {
    value: "DOCUMENTACAO",
    label: "Documentação",
    color: "bg-cyan-100 text-cyan-800 border border-cyan-200",
  },
  {
    value: "CONTRATADO",
    label: "Contratado",
    color: "bg-green-100 text-green-800 border border-green-200",
  },
  {
    value: "RECUSADO",
    label: "Recusado",
    color: "bg-red-100 text-red-800 border border-red-200",
  },
  {
    value: "DESISTIU",
    label: "Desistiu",
    color: "bg-gray-100 text-gray-800 border border-gray-200",
  },
  {
    value: "NAO_COMPARECEU",
    label: "Não Compareceu",
    color: "bg-gray-100 text-gray-800 border border-gray-200",
  },
  {
    value: "ARQUIVADO",
    label: "Arquivado",
    color: "bg-gray-100 text-gray-800 border border-gray-200",
  },
  {
    value: "CANCELADO",
    label: "Cancelado",
    color: "bg-red-100 text-red-800 border border-red-200",
  },
];

export const getStatusInfo = (status: string): StatusOption => {
  return (
    CANDIDATURA_STATUS_OPTIONS.find((option) => option.value === status) || {
      value: status,
      label: status,
      color: "bg-gray-100 text-gray-800 border border-gray-200",
    }
  );
};
