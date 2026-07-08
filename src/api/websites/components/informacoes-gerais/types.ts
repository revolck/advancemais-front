export interface HorarioItem {
  diaDaSemana: string; // ex: "segunda", "terca", "quarta" etc.
  horarioInicio: string; // HH:MM
  horarioFim: string; // HH:MM
}

export interface InformacoesGeraisBackendResponse {
  id: string;
  endereco: string;
  cep: string;
  cidade: string;
  estado: string;
  telefone1: string;
  telefone2?: string;
  whatsapp: string;
  // Campo antigo (compatibilidade para leituras legadas)
  horarioDeFuncionamento?: string;
  // Novo formato de horários por dia
  horarios?: HorarioItem[];
  linkedin?: string;
  facebook?: string;
  instagram: string;
  youtube?: string;
  trabalheConoscoUrl?: string | null;
  email: string;
  criadoEm?: string;
  atualizadoEm?: string;
}

export type CreateInformacoesGeraisPayload = Partial<
  Omit<InformacoesGeraisBackendResponse, "id" | "criadoEm" | "atualizadoEm">
>;

export type UpdateInformacoesGeraisPayload = CreateInformacoesGeraisPayload;
