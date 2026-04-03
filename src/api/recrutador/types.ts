/**
 * Tipos para o módulo de Recrutador
 * Escopo: empresas + vagas vinculadas ao recrutador
 */

import type { Curriculo } from "@/api/candidatos/types";
import type {
  EntrevistaCandidatoOpcaoItem,
  EntrevistaCreateResponseItem,
  EntrevistaCreatePayload,
  EntrevistaAgendaInfo,
  EntrevistaEndereco,
  EntrevistaEmpresaOpcaoItem,
  EntrevistaGoogleCapability,
  EntrevistaModalidade,
  EntrevistaOverviewCapabilities,
  EntrevistaOverviewItem,
  EntrevistaOverviewCandidato,
  EntrevistaOverviewEmpresa,
  EntrevistaOverviewRecrutador,
  EntrevistaOverviewVaga,
  EntrevistasOverviewFiltrosDisponiveis,
  EntrevistasOverviewSummary,
  EntrevistaStatus,
  EntrevistaVagaOpcaoItem,
} from "@/api/entrevistas/types";

export interface RecrutadorEmpresaEndereco {
  cep?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  pais?: string | null;
}

export interface RecrutadorEmpresa {
  id: string;
  nome: string;
  nomeExibicao?: string | null;
  email?: string | null;
  criadoEm?: string | null;
  cnpj?: string | null;
  telefone?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  bairro?: string | null;
  logradouro?: string | null;
  codUsuario?: string | null;
  avatarUrl?: string | null;
  status?: string | null;
  endereco?: RecrutadorEmpresaEndereco | null;
}

export interface RecrutadorEmpresasResponse {
  success: boolean;
  data: RecrutadorEmpresa[];
  message?: string;
}

export interface RecrutadorEmpresaEscopo {
  tipoAcesso: "EMPRESA" | "VAGA";
  empresaVinculadaDiretamente: boolean;
  totalVagasNoEscopo: number;
}

export interface RecrutadorEmpresaVagaResumo {
  id: string;
  titulo: string;
  codigo?: string | null;
  status: string;
}

export interface RecrutadorEmpresaDetailData {
  empresa: RecrutadorEmpresa;
  escopo: RecrutadorEmpresaEscopo;
  vagas: RecrutadorEmpresaVagaResumo[];
}

export interface RecrutadorEmpresaDetailResponse {
  success: boolean;
  data: RecrutadorEmpresaDetailData;
  message?: string;
}

export interface ListRecrutadorVagasParams {
  search?: string;
  empresaUsuarioId?: string;
  localizacao?: string;
  status?: string[]; // valores separados por vírgula na query (a API bloqueia RASCUNHO)
  page?: number;
  pageSize?: number;
  sortBy?: "titulo" | "inseridaEm" | "inscricoesAte" | "numeroVagas" | "empresaNome";
  sortDir?: "asc" | "desc";
}

export interface RecrutadorVagaEmpresaResumo {
  id: string;
  nome: string;
  nomeExibicao?: string | null;
  codUsuario?: string | null;
  cnpj?: string | null;
  avatarUrl?: string | null;
}

export interface RecrutadorVagaLocalizacaoResumo {
  cidade?: string | null;
  estado?: string | null;
  modalidadeLabel?: string | null;
  label?: string | null;
}

export interface RecrutadorVagaEscopoResumo {
  tipoAcesso?: "EMPRESA" | "VAGA";
  empresaVinculadaDiretamente?: boolean;
}

export interface RecrutadorVagaResumo {
  id: string;
  titulo: string;
  codigo?: string | null;
  status: string;
  statusLabel?: string | null;
  slug?: string | null;
  usuarioId?: string;
  empresaUsuarioId?: string;
  empresa?: RecrutadorVagaEmpresaResumo | null;
  localizacao?: RecrutadorVagaLocalizacaoResumo | null;
  modalidade?: string | null;
  regimeDeTrabalho?: string | null;
  jornada?: string | null;
  senioridade?: string | null;
  descricao?: string | null;
  observacoes?: string | null;
  modoAnonimo?: boolean | null;
  paraPcd?: boolean | null;
  numeroVagas?: number | null;
  inscricoesAte?: string | null;
  salarioMin?: string | number | null;
  salarioMax?: string | number | null;
  salarioConfidencial?: boolean | null;
  requisitos?: {
    obrigatorios?: string[] | null;
    desejaveis?: string[] | null;
  } | null;
  atividades?: {
    principais?: string[] | null;
    extras?: string[] | null;
  } | null;
  beneficios?: {
    lista?: string[] | null;
    observacoes?: string | null;
  } | null;
  areaInteresse?: {
    id?: number | null;
    categoria?: string | null;
  } | null;
  subareaInteresse?: {
    id?: number | null;
    nome?: string | null;
    areaId?: number | null;
  } | null;
  criadoEm?: string;
  inseridaEm?: string | null;
  atualizadoEm?: string | null;
  escopo?: RecrutadorVagaEscopoResumo | null;
}

export interface RecrutadorVagasFiltroOpcao {
  value: string;
  label: string;
  count?: number;
}

export interface RecrutadorVagasFiltroEmpresaOpcao {
  id: string;
  label: string;
  count?: number;
}

export interface RecrutadorVagasFiltrosDisponiveis {
  status: RecrutadorVagasFiltroOpcao[];
  empresas: RecrutadorVagasFiltroEmpresaOpcao[];
  localizacoes: RecrutadorVagasFiltroOpcao[];
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
  filtrosDisponiveis?: RecrutadorVagasFiltrosDisponiveis;
  message?: string;
}

export interface RecrutadorVagaDetailResponse {
  success: boolean;
  data: RecrutadorVagaResumo;
  message?: string;
}

export interface ListRecrutadorVagaCandidatosParams {
  search?: string;
  inscricaoDe?: string;
  inscricaoAte?: string;
  page?: number;
  pageSize?: number;
  sortBy?:
    | "nome"
    | "email"
    | "codigo"
    | "criadoEm"
    | "atualizadoEm"
    | "statusCandidatura";
  sortDir?: "asc" | "desc";
}

export interface RecrutadorVagaCandidatosVagaResumo {
  id: string;
  titulo: string;
  codigo?: string | null;
  status?: string | null;
}

export interface RecrutadorVagaCandidatosCurriculosResumo {
  total: number;
  principalTitulo?: string | null;
}

export interface RecrutadorVagaCandidatosCurriculoResumo {
  id: string;
  titulo: string;
  principal?: boolean | null;
  ultimaAtualizacao?: string | null;
}

export interface RecrutadorVagaCandidatosItem {
  candidaturaId: string;
  candidato: {
    id: string;
    nomeCompleto: string;
    cpf: string;
    codUsuario: string;
    email?: string | null;
    telefone?: string | null;
    avatarUrl?: string | null;
    cidade?: string | null;
    estado?: string | null;
  };
  statusCandidatura?: string | null;
  statusCandidaturaLabel?: string | null;
  criadoEm?: string | null;
  atualizadoEm?: string | null;
  curriculosResumo?: RecrutadorVagaCandidatosCurriculosResumo | null;
  curriculo?: RecrutadorVagaCandidatosCurriculoResumo | null;
  experienciaResumo?: string | null;
  formacaoResumo?: string | null;
}

export interface RecrutadorVagaCandidatosResponse {
  success: boolean;
  data: {
    vaga: RecrutadorVagaCandidatosVagaResumo;
    items: RecrutadorVagaCandidatosItem[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
  message?: string;
}

export interface UpdateRecrutadorVagaCandidaturaStatusPayload {
  statusId: string;
}

export interface RecrutadorVagaCandidaturaStatusUpdateResponse {
  success: boolean;
  data?: {
    candidaturaId: string;
    vagaId: string;
    statusId?: string | null;
    status?: string | null;
    statusLabel?: string | null;
    atualizadoEm?: string | null;
  } | null;
  message?: string;
}

export interface ListRecrutadorCandidatosParams {
  search?: string;
  empresaUsuarioId?: string;
  vagaId?: string;
  criadoDe?: string;
  criadoAte?: string;
  page?: number;
  pageSize?: number;
}

export interface RecrutadorCandidatoCandidaturasResumo {
  total: number;
  empresaIds: string[];
  vagaIds: string[];
}

export interface RecrutadorCandidatoResumo {
  id: string;
  nomeCompleto: string;
  cpf: string;
  codUsuario: string;
  email?: string | null;
  telefone?: string | null;
  avatarUrl?: string | null;
  cidade?: string | null;
  estado?: string | null;
  curriculos?: number;
  criadoEm?: string | null;
  atualizadoEm?: string | null;
  candidaturasResumo: RecrutadorCandidatoCandidaturasResumo;
}

export interface RecrutadorCandidatosResponse {
  success: boolean;
  data: RecrutadorCandidatoResumo[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

export interface RecrutadorCandidatoVagaResumo {
  id: string;
  titulo: string;
  codigo?: string | null;
  status?: string | null;
}

export interface RecrutadorCandidatoEmpresaResumo {
  id: string;
  nomeExibicao: string;
  codigo?: string | null;
}

export interface RecrutadorCandidatoCurriculoResumo {
  id: string;
  titulo: string;
  principal?: boolean | null;
  ultimaAtualizacao?: string | null;
}

export interface RecrutadorCandidatoCandidatura {
  id: string;
  statusId?: string | null;
  status: string;
  vaga: RecrutadorCandidatoVagaResumo;
  empresa: RecrutadorCandidatoEmpresaResumo;
  curriculo?: RecrutadorCandidatoCurriculoResumo | null;
}

export interface RecrutadorCandidatoDetailCandidato {
  id: string;
  nomeCompleto: string;
  cpf: string;
  codUsuario: string;
  email?: string | null;
  telefone?: string | null;
  avatarUrl?: string | null;
  cidade?: string | null;
  estado?: string | null;
}

export interface RecrutadorCandidatoDetailEscopo {
  totalCandidaturasVisiveis: number;
  tipoAcesso: "EMPRESA" | "VAGA";
}

export interface RecrutadorCandidatoDetailData {
  candidato: RecrutadorCandidatoDetailCandidato;
  curriculosResumo: {
    total: number;
  };
  candidaturas: RecrutadorCandidatoCandidatura[];
  escopo: RecrutadorCandidatoDetailEscopo;
}

export interface RecrutadorCandidatoDetailResponse {
  success: boolean;
  data: RecrutadorCandidatoDetailData;
  message?: string;
}

export interface RecrutadorCandidatoCurriculoDetailResponse {
  success: boolean;
  data: Curriculo;
  message?: string;
}

export interface ListRecrutadorCandidatoEntrevistasParams {
  page?: number;
  pageSize?: number;
  sortBy?:
    | "agendadaPara"
    | "criadoEm"
    | "statusEntrevista"
    | "vagaTitulo"
    | "empresaNome";
  sortDir?: "asc" | "desc";
  statusEntrevista?: Array<"AGENDADA" | "CANCELADA">;
  modalidades?: Array<"ONLINE" | "PRESENCIAL">;
  dataInicio?: string;
  dataFim?: string;
}

export interface RecrutadorCandidatoEntrevistaItem {
  id: string;
  candidaturaId?: string | null;
  empresaAnonima?: boolean;
  statusEntrevista: EntrevistaStatus;
  statusEntrevistaLabel?: string | null;
  modalidade?: EntrevistaModalidade | null;
  modalidadeLabel?: string | null;
  agendadaPara?: string | null;
  agendadaParaFormatada?: string | null;
  dataInicio?: string | null;
  dataFim?: string | null;
  descricao?: string | null;
  meetUrl?: string | null;
  local?: string | null;
  enderecoPresencial?: EntrevistaEndereco | null;
  vaga: EntrevistaOverviewVaga;
  empresa?: EntrevistaOverviewEmpresa | null;
  recrutador?: EntrevistaOverviewRecrutador | null;
  candidato?: EntrevistaOverviewCandidato | null;
  agenda?: EntrevistaAgendaInfo | null;
  meta?: Record<string, unknown> | null;
  criadoEm?: string | null;
  atualizadoEm?: string | null;
}

export interface RecrutadorCandidatoEntrevistasListData {
  items: RecrutadorCandidatoEntrevistaItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface RecrutadorCandidatoEntrevistasResponse {
  success: boolean;
  data: RecrutadorCandidatoEntrevistasListData;
  message?: string;
}

export interface RecrutadorCandidatoEntrevistaOpcaoItem {
  candidaturaId: string;
  empresa: {
    id: string;
    nomeExibicao?: string | null;
    codigo?: string | null;
    anonima?: boolean;
    labelExibicao?: string | null;
  } | null;
  vaga: {
    id: string;
    codigo?: string | null;
    titulo: string;
    status?: string | null;
    statusLabel?: string | null;
  } | null;
  candidato: {
    id: string;
    codigo?: string | null;
    nome: string;
  } | null;
  statusCandidatura?: string | null;
  statusCandidaturaLabel?: string | null;
  tipoAcesso?: "EMPRESA" | "VAGA";
  empresaVinculadaDiretamente?: boolean;
  entrevistaAtiva: boolean;
  entrevistaAtivaId?: string | null;
  empresaAnonima?: boolean;
  anonimatoBloqueado?: boolean;
  enderecoPadraoEntrevista?: EntrevistaEndereco | null;
}

export interface RecrutadorCandidatoEntrevistaOpcoesDefaults {
  empresaUsuarioId?: string | null;
  vagaId?: string | null;
  candidaturaId?: string | null;
}

export interface RecrutadorCandidatoEntrevistaOpcoesResponse
  extends EntrevistaOverviewCapabilities {
  google?: EntrevistaGoogleCapability | null;
  defaults?: RecrutadorCandidatoEntrevistaOpcoesDefaults | null;
  items: RecrutadorCandidatoEntrevistaOpcaoItem[];
}

export interface RecrutadorCandidatoCreateEntrevistaPayload {
  candidaturaId: string;
  empresaUsuarioId: string;
  vagaId: string;
  modalidade: EntrevistaModalidade;
  dataInicio: string;
  dataFim: string;
  descricao?: string | null;
  empresaAnonima?: boolean;
  enderecoPresencial?: EntrevistaEndereco | null;
}

export type RecrutadorCandidatoCreateEntrevistaResponse =
  EntrevistaCreateResponseItem;

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
  data?: RecrutadorCandidatoEntrevistaItem | null;
  entrevista?: RecrutadorCandidatoEntrevistaItem | null;
  message?: string;
}

export interface ListRecrutadorEntrevistasOverviewParams {
  page?: number;
  pageSize?: number;
  search?: string;
  empresaUsuarioId?: string;
  vagaId?: string;
  recrutadorId?: string;
  statusEntrevista?: string[] | string;
  modalidades?: string[] | string;
  dataInicio?: string;
  dataFim?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export interface RecrutadorEntrevistasOverviewResponse {
  items: EntrevistaOverviewItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  summary?: EntrevistasOverviewSummary;
  filtrosDisponiveis?: EntrevistasOverviewFiltrosDisponiveis;
  capabilities?: EntrevistaOverviewCapabilities;
}

export type RecrutadorEntrevistaEmpresaOpcaoItem = EntrevistaEmpresaOpcaoItem;
export type RecrutadorEntrevistaVagaOpcaoItem = EntrevistaVagaOpcaoItem;
export type RecrutadorEntrevistaCandidatoOpcaoItem = EntrevistaCandidatoOpcaoItem;

export interface RecrutadorEntrevistaOpcoesResponse<TItem> {
  items: TItem[];
}

export type RecrutadorEntrevistaCreatePayload = EntrevistaCreatePayload;
export type RecrutadorEntrevistaCreateResponse = EntrevistaCreateResponseItem;
