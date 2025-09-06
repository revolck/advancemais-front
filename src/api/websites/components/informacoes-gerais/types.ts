export interface InformacoesGeraisBackendResponse {
  id: string;
  endereco: string;
  cep: string;
  cidade: string;
  estado: string;
  telefone1: string;
  telefone2?: string;
  whatsapp: string;
  horarioDeFuncionamento: string;
  linkedin?: string;
  facebook?: string;
  instagram: string;
  youtube?: string;
  email: string;
  criadoEm?: string;
  atualizadoEm?: string;
}

export type CreateInformacoesGeraisPayload = Partial<
  Omit<InformacoesGeraisBackendResponse, "id" | "criadoEm" | "atualizadoEm">
>;

export type UpdateInformacoesGeraisPayload = CreateInformacoesGeraisPayload;
