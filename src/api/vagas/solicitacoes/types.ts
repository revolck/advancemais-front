/**
 * Tipos para o módulo de Solicitações de Publicação de Vagas
 */

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
    cnpj?: string;
  };
  solicitante?: {
    id: string;
    nome: string;
  };
  status: SolicitacaoStatus;
  dataSolicitacao: string;
  dataResposta?: string | null;
  motivoRejeicao?: string | null;
  observacoes?: string | null;
}

export interface SolicitacoesListParams {
  page?: number;
  pageSize?: number;
  status?: SolicitacaoStatus[];
  empresaId?: string;
  criadoDe?: string | Date;
  criadoAte?: string | Date;
  search?: string;
}

export interface SolicitacoesListResponse {
  data: SolicitacaoVaga[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface AprovarSolicitacaoPayload {
  observacoes?: string;
}

export interface RejeitarSolicitacaoPayload {
  motivoRejeicao: string;
}

export interface SolicitacaoActionResponse {
  success: boolean;
  message: string;
}

/**
 * Métricas do Setor de Vagas para o Dashboard
 */
export interface SetorDeVagasMetricas {
  totalEmpresas: number;
  empresasAtivas: number;
  totalVagas: number;
  vagasAbertas: number;
  vagasPendentes: number;
  vagasEncerradas: number;
  totalCandidatos: number;
  candidatosEmProcesso: number;
  candidatosContratados: number;
  solicitacoesPendentes: number;
  solicitacoesAprovadasHoje: number;
  solicitacoesRejeitadasHoje: number;
}

export interface SetorDeVagasMetricasResponse {
  metricasGerais: SetorDeVagasMetricas;
}
