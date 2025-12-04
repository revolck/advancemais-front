// Re-exporta tipos da API
export type {
  SolicitacaoVaga,
  SolicitacaoStatus,
} from "@/api/vagas/solicitacoes/types";

export interface SolicitacaoDashboardProps {
  className?: string;
  solicitacoes?: import("@/api/vagas/solicitacoes/types").SolicitacaoVaga[];
  fetchFromApi?: boolean;
  itemsPerPage?: number;
  pageSize?: number;
  onDataLoaded?: (data: import("@/api/vagas/solicitacoes/types").SolicitacaoVaga[]) => void;
  onError?: (error: Error) => void;
}
