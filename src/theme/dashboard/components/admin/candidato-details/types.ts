import type { ReactNode } from "react";
import type {
  AdminCandidatoConsolidatedData,
} from "@/api/candidatos/admin";
import type * as CandidatoTypes from "@/api/candidatos/types";
export type {
  CandidatoOverview,
  Candidatura,
  CandidaturaStatus,
} from "@/api/candidatos/types";

export interface CandidatoDetailsViewProps {
  candidatoId: string;
  initialConsolidated: AdminCandidatoConsolidatedData;
}

export type CandidatoDetailsData = CandidatoTypes.CandidatoOverview;

export interface HorizontalTabItem {
  value: string;
  label: string;
  icon: string;
  content: ReactNode;
}

export interface HeaderInfoProps {
  candidato: CandidatoDetailsData;
  onEditCandidato?: () => void;
  onBloquearCandidato?: () => void;
  onDesbloquearCandidato?: () => void;
  onUpdateStatus?: (candidaturaId: string, status: string) => void;
}

export interface AboutTabProps {
  candidato: CandidatoDetailsData;
  isLoading?: boolean;
}

export interface CandidaturasTabProps {
  candidato: CandidatoDetailsData;
  candidaturas?: any[];
  onUpdateStatus?: (candidaturaId: string, status: string) => void;
  isLoading?: boolean;
}

export interface CurriculosTabProps {
  candidato: CandidatoDetailsData;
  curriculos?: any[];
  isLoading?: boolean;
}

export interface ContatoTabProps {
  candidato: CandidatoDetailsData;
  isLoading?: boolean;
}

export interface HistoricoTabProps {
  candidato: CandidatoDetailsData;
}
