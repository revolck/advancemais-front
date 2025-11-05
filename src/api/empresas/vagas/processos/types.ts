export type VagaProcessoStatus =
  | "RECEBIDA"
  | "EM_ANALISE"
  | "ENTREVISTA"
  | "APROVADA"
  | "REJEITADA"
  | "CANCELADA";

export type VagaProcessoOrigem = "SITE" | "DASHBOARD" | "IMPORTACAO";

export interface VagaProcesso {
  id: string;
  vagaId: string;
  candidatoId: string;
  status: VagaProcessoStatus;
  origem: VagaProcessoOrigem;
  observacoes?: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface VagaProcessoListParams {
  status?: string; // comma-separated on backend
  origem?: string; // comma-separated on backend
  candidatoId?: string;
}

export interface VagaProcessoListResponse {
  message?: string;
  vagaId: string;
  total: number;
  processos: VagaProcesso[];
}

export interface CreateVagaProcessoPayload {
  candidatoId: string;
  status: VagaProcessoStatus;
  origem: VagaProcessoOrigem;
  observacoes?: string;
}

export interface UpdateVagaProcessoPayload {
  status?: VagaProcessoStatus;
  origem?: VagaProcessoOrigem;
  observacoes?: string;
}

