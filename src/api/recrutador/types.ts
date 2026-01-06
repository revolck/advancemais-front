/**
 * Tipos para o módulo de Recrutador
 * Escopo: empresas + vagas vinculadas ao recrutador
 */

export interface RecrutadorEmpresa {
  id: string;
  nome: string;
  email?: string;
  cnpj?: string;
  telefone?: string;
  cidade?: string;
  estado?: string;
  endereco?: {
    cep?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    pais?: string;
  };
}

export interface RecrutadorEmpresasResponse {
  success: boolean;
  data: RecrutadorEmpresa[];
  message?: string;
}

export interface ListRecrutadorVagasParams {
  empresaUsuarioId?: string;
  status?: string[]; // valores separados por vírgula na query (a API bloqueia RASCUNHO)
  page?: number;
  pageSize?: number;
}

export interface RecrutadorVagaResumo {
  id: string;
  titulo: string;
  codigo?: string;
  status: string;
  empresaUsuarioId?: string;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface RecrutadorVagasResponse {
  success: boolean;
  data: RecrutadorVagaResumo[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

export interface RecrutadorVagaDetailResponse {
  success: boolean;
  data: RecrutadorVagaResumo;
  message?: string;
}

export interface CreateRecrutadorEntrevistaPayload {
  dataInicio: string; // ISO
  dataFim: string; // ISO
  descricao?: string;
}

export interface RecrutadorEntrevista {
  id: string;
  meetUrl?: string;
  meetEventId?: string;
  dataInicio: string;
  dataFim: string;
  descricao?: string | null;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface CreateRecrutadorEntrevistaResponse {
  success: boolean;
  entrevista: RecrutadorEntrevista;
  message?: string;
}

export interface GetRecrutadorEntrevistaResponse {
  success: boolean;
  entrevista: RecrutadorEntrevista;
  message?: string;
}

