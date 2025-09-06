export interface DepoimentoBackendResponse {
  id: string; // ordem-uuid (ID da ordem)
  depoimentoId: string; // ID real do depoimento
  depoimento: string;
  nome: string;
  cargo: string;
  fotoUrl: string;
  status?: string; // PUBLICADO | RASCUNHO
  ordem: number;
  ordemCriadoEm?: string;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface CreateDepoimentoPayload {
  depoimento: string;
  nome: string;
  cargo?: string;
  foto?: File | Blob;
  fotoUrl?: string;
  ordem?: number;
  status?: boolean | string;
}

export interface UpdateDepoimentoPayload {
  depoimento?: string;
  nome?: string;
  cargo?: string;
  foto?: File | Blob;
  fotoUrl?: string;
  ordem?: number;
  status?: boolean | string;
}
