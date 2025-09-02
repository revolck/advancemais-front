export interface TeamBackendResponse {
  id: string; // ordem-uuid (ID da ordem)
  teamId: string; // ID real do membro
  photoUrl: string;
  nome: string;
  cargo: string;
  status?: string; // PUBLICADO | RASCUNHO
  ordem: number;
  ordemCriadoEm?: string;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface CreateTeamPayload {
  nome: string;
  cargo: string;
  photo?: File | Blob;
  photoUrl?: string;
  ordem?: number;
  status?: boolean | string;
}

export interface UpdateTeamPayload {
  nome?: string;
  cargo?: string;
  photo?: File | Blob;
  photoUrl?: string;
  ordem?: number;
  status?: boolean | string;
}
