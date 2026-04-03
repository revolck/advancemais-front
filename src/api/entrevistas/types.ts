export type EntrevistaStatus =
  | "AGENDADA"
  | "CONFIRMADA"
  | "REALIZADA"
  | "CANCELADA"
  | "REAGENDADA"
  | "NAO_COMPARECEU"
  | (string & {});

export type EntrevistaModalidade =
  | "ONLINE"
  | "PRESENCIAL"
  | (string & {});

export interface EntrevistaFiltroDisponivel {
  value: string;
  label: string;
  count?: number;
}

export interface EntrevistaOverviewCandidato {
  id: string;
  codigo?: string | null;
  nome: string;
  email?: string | null;
  cpf?: string | null;
  telefone?: string | null;
  avatarUrl?: string | null;
  cidade?: string | null;
  estado?: string | null;
}

export interface EntrevistaOverviewVaga {
  id: string;
  codigo?: string | null;
  titulo: string;
  status?: string | null;
}

export interface EntrevistaOverviewEmpresa {
  id: string;
  nomeExibicao?: string | null;
  anonima?: boolean;
  labelExibicao?: string | null;
  logoUrl?: string | null;
}

export interface EntrevistaOverviewRecrutador {
  id: string;
  nome: string;
  email?: string | null;
  avatarUrl?: string | null;
}

export interface EntrevistaEndereco {
  cep?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  pontoReferencia?: string | null;
}

export interface EntrevistaAgendaInfo {
  eventoInternoId?: string | null;
  criadoNoSistema?: boolean;
  provider?: string | null;
  organizerSource?: string | null;
  organizerUserId?: string | null;
  organizerEmail?: string | null;
}

export interface EntrevistaGoogleCapability {
  connected?: boolean;
  expired?: boolean;
  calendarId?: string | null;
  expiraEm?: string | null;
  connectEndpoint?: string | null;
  disconnectEndpoint?: string | null;
  statusEndpoint?: string | null;
}

export interface EntrevistaOverviewCapabilities {
  canCreate?: boolean;
  canCreatePresencial?: boolean;
  canCreateOnline?: boolean;
  requiresGoogleForOnline?: boolean;
  google?: EntrevistaGoogleCapability | null;
}

export interface EntrevistaOverviewItem {
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
  candidato: EntrevistaOverviewCandidato;
  vaga: EntrevistaOverviewVaga;
  empresa?: EntrevistaOverviewEmpresa | null;
  recrutador?: EntrevistaOverviewRecrutador | null;
  meta?: Record<string, unknown> | null;
  agenda?: EntrevistaAgendaInfo | null;
  criadoEm?: string | null;
  atualizadoEm?: string | null;
}

export interface EntrevistasOverviewSummary {
  totalEntrevistas: number;
  agendadas: number;
  confirmadas: number;
  realizadas: number;
  canceladas: number;
  naoCompareceram: number;
}

export interface EntrevistasOverviewFiltrosDisponiveis {
  statusEntrevista?: EntrevistaFiltroDisponivel[];
  modalidades?: EntrevistaFiltroDisponivel[];
}

export interface EntrevistasOverviewListParams {
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

export interface EntrevistasOverviewListResponse {
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

export interface EntrevistaEmpresaOpcaoItem {
  id: string;
  nomeExibicao: string;
  codigo?: string | null;
  cnpj?: string | null;
  email?: string | null;
  logoUrl?: string | null;
  totalVagasElegiveis?: number;
  enderecoPadraoEntrevista?: EntrevistaEndereco | null;
}

export interface EntrevistaVagaOpcaoItem {
  id: string;
  codigo?: string | null;
  titulo: string;
  status?: string | null;
  statusLabel?: string | null;
  empresaUsuarioId: string;
  empresaAnonima?: boolean;
  anonimatoOrigem?: string | null;
  anonimatoBloqueado?: boolean;
  candidatosElegiveis?: number;
}

export interface EntrevistaOpcaoCandidato {
  id: string;
  codigo?: string | null;
  nome: string;
  email?: string | null;
  cpf?: string | null;
  telefone?: string | null;
  avatarUrl?: string | null;
  cidade?: string | null;
  estado?: string | null;
}

export interface EntrevistaCandidatoOpcaoItem {
  candidaturaId: string;
  candidato: EntrevistaOpcaoCandidato;
  statusCandidatura?: string | null;
  statusCandidaturaLabel?: string | null;
  ultimaAtualizacaoEm?: string | null;
  entrevistaAtiva: boolean;
  entrevistaAtivaId?: string | null;
}

export interface EntrevistaCreatePayload {
  empresaUsuarioId: string;
  vagaId: string;
  candidaturaId: string;
  candidatoId?: string | null;
  empresaAnonima?: boolean;
  modalidade: EntrevistaModalidade;
  dataInicio: string;
  dataFim: string;
  descricao?: string | null;
  enderecoPresencial?: EntrevistaEndereco | null;
  gerarMeet?: boolean;
}

export interface EntrevistaCreateResponseItem {
  id: string;
  candidaturaId?: string | null;
  empresaAnonima?: boolean;
  statusEntrevista: EntrevistaStatus;
  statusEntrevistaLabel?: string | null;
  modalidade?: EntrevistaModalidade | null;
  modalidadeLabel?: string | null;
  dataInicio?: string | null;
  dataFim?: string | null;
  agendadaPara?: string | null;
  agendadaParaFormatada?: string | null;
  descricao?: string | null;
  meetUrl?: string | null;
  local?: string | null;
  enderecoPresencial?: EntrevistaEndereco | null;
  agenda?: EntrevistaAgendaInfo | null;
  candidato?: {
    id: string;
    nome: string;
    codigo?: string | null;
  } | null;
  vaga?: {
    id: string;
    titulo: string;
    codigo?: string | null;
  } | null;
  empresa?: {
    id: string;
    nomeExibicao?: string | null;
    anonima?: boolean;
    labelExibicao?: string | null;
  } | null;
  recrutador?: {
    id: string;
    nome: string;
  } | null;
  criadoEm?: string | null;
}
