export type SolicitacaoStatus = "PENDENTE" | "APROVADA" | "REJEITADA" | "CANCELADA";

export interface SolicitacaoVaga {
  id: string;
  codigo: string;
  vaga: {
    id: string;
    titulo: string;
    codigo?: string;
  };
  empresa: {
    id: string;
    nome: string;
    codigo?: string;
  };
  solicitante?: {
    id: string;
    nome: string;
  };
  status: SolicitacaoStatus;
  dataSolicitacao: string;
  dataResposta?: string;
  motivoRejeicao?: string;
  observacoes?: string;
}

export interface SolicitacaoDashboardProps {
  className?: string;
  solicitacoes?: SolicitacaoVaga[];
  fetchFromApi?: boolean;
  itemsPerPage?: number;
  pageSize?: number;
  onDataLoaded?: (data: SolicitacaoVaga[]) => void;
  onError?: (error: Error) => void;
}

