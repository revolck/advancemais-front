export interface SistemaBackendResponse {
  id: string;
  titulo: string;
  descricao: string;
  subtitulo: string;
  etapa1Titulo: string;
  etapa1Descricao: string;
  etapa2Titulo: string;
  etapa2Descricao: string;
  etapa3Titulo: string;
  etapa3Descricao: string;
  criadoEm?: string;
  atualizadoEm?: string;
}

export type CreateSistemaPayload = Omit<SistemaBackendResponse, "id" | "criadoEm" | "atualizadoEm">;
export type UpdateSistemaPayload = CreateSistemaPayload;
