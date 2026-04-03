import type {
  EntrevistaCreateResponseItem,
  EntrevistaEndereco,
  EntrevistaGoogleCapability,
  EntrevistaModalidade,
  EntrevistaOverviewCapabilities,
  EntrevistaOverviewItem,
} from "@/api/entrevistas/types";

// Tipos básicos para Cursos
export interface Curso {
  id: string;
  nome: string;
  codigo: string;
  descricao: string;
  descricaoHtml?: string;
  conteudoProgramatico?: string | null;
  cargaHoraria: number;
  categoriaId: number | string;
  statusPadrao: "PUBLICADO" | "RASCUNHO";
  criadoEm: string;
  atualizadoEm: string;
  imagemUrl?: string;
  subcategoriaId?: number | string;
  valor: number;
  valorPromocional?: number;
  gratuito: boolean;
  estagioObrigatorio?: boolean;
  notaMinima?: number;
  frequenciaMinimaPct?: number;
  categoria?: { id: string; nome: string };
  subcategoria?: { id: string; nome: string };
  turmasCount?: number;
}

// Meta do curso (contagens para validação)
export interface CursoMeta {
  cursoId: string;
  templatesAulasCount: number;
  templatesAvaliacoesCount: number;
  turmasCount: number;
  inscricoesAtivas: number;
}

export interface CreateCursoPayload {
  nome: string;
  descricao: string;
  conteudoProgramatico?: string | null;
  cargaHoraria: number;
  categoriaId: number;
  statusPadrao?: "PUBLICADO" | "RASCUNHO";
  subcategoriaId?: number;
  estagioObrigatorio?: boolean;
  imagemUrl?: string;
  valor: number;
  valorPromocional?: number;
  gratuito?: boolean;
}

export type UpdateCursoPayload = Partial<CreateCursoPayload>;

export interface CursosListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  statusPadrao?: "PUBLICADO" | "RASCUNHO" | ("PUBLICADO" | "RASCUNHO")[];
  categoriaId?: number;
}

export interface CursosListResponse {
  data: Curso[];
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface CursosModuleMeta {
  totalCursos: number;
  totalTurmas: number;
  totalInscricoes: number;
}

// Módulos
export interface CursoModulo {
  id: string;
  nome: string;
  descricao?: string;
  ordem?: number;
  turmaId: string;
  cursoId?: number | string;
}

// Turmas
export interface CursoTurma {
  id: string;
  codigo: string;
  nome: string;
  turno: "MANHA" | "TARDE" | "NOITE" | "INTEGRAL";
  metodo: "ONLINE" | "PRESENCIAL" | "LIVE" | "SEMIPRESENCIAL";
  status?: string;
  publicacaoStatus?: TurmaPublicacaoStatus;
  publicado?: boolean;
  vagasIlimitadas?: boolean;
  vagasTotais?: number;
  vagasDisponiveis?: number;
  inscricoesCount?: number;
  vagasOcupadas?: number;
  vagasDisponiveisCalculadas?: number | null;
  dataInicio?: string;
  dataFim?: string;
  dataInscricaoInicio?: string;
  dataInscricaoFim?: string;
  instrutor?: {
    id: string;
    nome?: string;
    email?: string;
    codUsuario?: string;
  };
  criadoPorId?: string;
  criadoEm?: string;
  editadoPorId?: string;
  editadoEm?: string;
  estruturaTipo?: TurmaEstruturaTipo;
  estrutura?: CreateTurmaEstruturaPayload;
  aulas?: Array<Record<string, unknown>>;
  provas?: Array<Record<string, unknown>>;
  itens?: Array<Record<string, unknown>>;
  instrutores?: Array<Record<string, unknown>>;
  alunos?: Array<Record<string, unknown>>;
}

export type UpdateTurmaPayload = Partial<CreateTurmaPayload>;

// =============================================================================
// Vínculo de templates ao curso (pré-requisito de turmas)
// =============================================================================

export interface VincularTemplatesAoCursoPayload {
  cursoId: string;
  aulaTemplateIds?: string[];
  avaliacaoTemplateIds?: string[];
}

export interface VincularTemplatesAoCursoResponse {
  success: boolean;
  data: {
    updatedAulas: number;
    updatedAvaliacoes: number;
  };
}

export type TurmaEstruturaTipo = "MODULAR" | "DINAMICA" | "PADRAO";
export type TurmaPublicacaoStatus = "RASCUNHO" | "PUBLICADO";
export type TurmaStatus =
  | "RASCUNHO"
  | "PUBLICADO"
  | "INSCRICOES_ABERTAS"
  | "INSCRICOES_ENCERRADAS"
  | "EM_ANDAMENTO"
  | "CONCLUIDO";

export interface CreateTurmaEstruturaItemPayload {
  type: "AULA" | "PROVA" | "ATIVIDADE";
  title: string;
  templateId: string;
  /** Ordem manual do item dentro do módulo/bloco. Se não enviar, o backend usa a ordem da lista. */
  ordem?: number;
  startDate?: string | null;
  endDate?: string | null;
  instructorIds?: string[];
  /**
   * Status opcional do item instanciado.
   * Útil para publicar automaticamente itens clonados de templates em rascunho.
   */
  status?: string;
  obrigatoria: boolean;
  recuperacaoFinal?: boolean;
}

export interface CreateTurmaEstruturaModulePayload {
  /**
   * UUID do módulo (opcional; útil em fluxos de edição/reordenação).
   * Para criação, normalmente não é enviado.
   */
  id?: string;
  title: string;
  /** Ordem manual do módulo (opcional). Se não enviar, o backend usa a ordem da lista. */
  ordem?: number;
  items: CreateTurmaEstruturaItemPayload[];
}

export interface CreateTurmaEstruturaPayload {
  modules: CreateTurmaEstruturaModulePayload[];
  standaloneItems: CreateTurmaEstruturaItemPayload[];
}

export interface CreateTurmaPayload {
  estruturaTipo: TurmaEstruturaTipo;
  nome: string;
  turno: "MANHA" | "TARDE" | "NOITE" | "INTEGRAL";
  metodo: "ONLINE" | "PRESENCIAL" | "LIVE" | "SEMIPRESENCIAL";
  dataInscricaoInicio: string;
  dataInscricaoFim: string;
  dataInicio: string;
  dataFim: string;
  vagasIlimitadas: boolean;
  vagasTotais?: number;
  /**
   * Apenas status inicial de publicação.
   * Os demais status (INSCRICOES_*, EM_ANDAMENTO, CONCLUIDO) são definidos automaticamente pelo backend conforme datas.
   */
  status?: TurmaPublicacaoStatus;
  instrutorIds?: string[];
  /**
   * Compatibilidade com backend legado (instrutor principal).
   * Quando enviar `instrutorIds`, o backend usa o primeiro como `instrutorId`.
   */
  instrutorId?: string;
  estrutura: CreateTurmaEstruturaPayload;
}

// Inscrições
export interface TurmaInscricao {
  id: string;
  alunoId: string;
  status?: string;
  statusInscricao?: string;
  statusPagamento?: string;
  progresso?: number;
  criadoEm?: string;
  observacoes?: string;
  aluno?: {
    id: string;
    nome?: string;
    nomeCompleto?: string;
    email?: string;
    cpf?: string;
    avatarUrl?: string;
    codigo?: string;
    codUsuario?: string;
  };
  curso?: {
    id: string;
    nome: string;
    codigo: string;
  };
}

export interface CreateInscricaoPayload {
  alunoId: string;
  status?: string;
  observacoes?: string;
  prazoAdaptacaoDias?: number;
}

export type StatusInscricao =
  | "AGUARDANDO_PAGAMENTO"
  | "INSCRITO"
  | "EM_ANDAMENTO"
  | "EM_ESTAGIO"
  | "CONCLUIDO"
  | "REPROVADO"
  | "CANCELADO"
  | "TRANCADO";

export interface InscricaoCurso {
  id: string;
  alunoId: string;
  statusInscricao: StatusInscricao;
  statusPagamento?: string;
  criadoEm: string;
  progresso: number;
  aluno: {
    id: string;
    nomeCompleto: string;
    email: string;
    cpf?: string;
    avatarUrl?: string;
    codigo?: string;
    codUsuario?: string;
  };
  turma?: {
    id: string;
    nome?: string;
  };
}

// Provas
export type ProvaStatus =
  | "RASCUNHO"
  | "PUBLICADA"
  | "EM_ANDAMENTO"
  | "CONCLUIDA"
  | "CANCELADA";

export interface TurmaProva {
  id: string;
  codigo?: string;
  cursoId?: string | number | null;
  titulo?: string;
  nome?: string;
  descricao?: string;
  tipo?: AvaliacaoTipo | string;
  tipoAtividade?: AvaliacaoTipoAtividade | "TEXTO" | null;
  recuperacaoFinal?: boolean;
  status?: ProvaStatus;
  data?: string;
  dataInicio?: string;
  dataFim?: string;
  horaInicio?: string;
  horaFim?: string;
  horaTermino?: string;
  inicioPrevisto?: string;
  fimPrevisto?: string;
  etiqueta?: string;
  peso?: number;
  valeNota?: boolean;
  valePonto?: boolean;
  obrigatoria?: boolean;
  duracaoMinutos?: number;
  ativo?: boolean;
  localizacao?: "TURMA" | "MODULO";
  turmaId?: string;
  moduloId?: string;
  modalidade?: "ONLINE" | "PRESENCIAL" | "AO_VIVO" | "SEMIPRESENCIAL";
  instrutorId?: string;
  curso?:
    | string
    | {
        id: string;
        codigo?: string;
        nome?: string;
      }
    | null;
  cursoNome?: string | null;
  turma?:
    | string
    | {
        id: string;
        codigo?: string;
        nome?: string;
        modalidade?: string;
        instrutorId?: string | null;
        instrutor?: {
          id?: string;
          nome?: string;
        } | null;
      }
    | null;
  turmaNome?: string | null;
  instrutor?:
    | string
    | {
        id: string;
        nome?: string;
        email?: string;
        role?: string;
      }
    | null;
  questoes?: AvaliacaoQuestao[] | AvaliacaoQuestaoLegacy[];
  criadoEm?: string;
  atualizadoEm?: string;
  criadoPor?: {
    id?: string;
    nome?: string | null;
    nomeCompleto?: string | null;
    role?: string | null;
  } | null;
}

export interface CreateProvaPayload {
  titulo: string;
  etiqueta?: string;
  tipo?: "PROVA" | "ATIVIDADE";
  recuperacaoFinal?: boolean;
  tipoAtividade?: "QUESTOES" | "TEXTO"; // Apenas para ATIVIDADE
  peso?: number;
  valeNota?: boolean;
  valePonto?: boolean;
  localizacao?: "TURMA" | "MODULO";
  moduloId?: string;
  dataInicio?: string;
  dataFim?: string;
  horaInicio?: string;
  horaFim?: string;
  duracaoMinutos?: number;
  modalidade?: "ONLINE" | "PRESENCIAL" | "AO_VIVO" | "SEMIPRESENCIAL";
  instrutorId?: string;
  obrigatoria?: boolean;
  status?: "RASCUNHO" | "PUBLICADA";
  // Dados específicos por tipo de atividade
  questoes?: Array<{
    id: string;
    titulo: string;
    alternativas: Array<{
      id: string;
      texto: string;
    }>;
    respostaCorreta: string | null;
  }>;
  texto?: {
    titulo: string;
  };
  arquivo?: {
    titulo: string;
    arquivoUrl?: string;
    arquivoNome?: string;
    arquivoTamanho?: number;
    arquivoMimeType?: string;
  };
}

export type UpdateProvaPayload = Partial<CreateProvaPayload>;

// Tokens Únicos para Provas/Atividades Online ou Ao Vivo
export interface ProvaToken {
  id: string;
  provaId: string;
  inscricaoId: string;
  token: string; // Token único gerado
  respondido: boolean; // Se o usuário já respondeu
  nota?: number | null; // Nota obtida (0-10)
  respondidoEm?: string | null; // Data/hora da resposta
  criadoEm: string;
  atualizadoEm: string;
  aluno?: {
    id: string;
    nome?: string;
    nomeCompleto?: string;
    email?: string;
  };
  inscricao?: {
    id: string;
    alunoId: string;
    status?: string;
  };
}

export interface CreateProvaTokenPayload {
  inscricaoId: string;
}

export interface ListProvaTokensParams {
  page?: number;
  pageSize?: number;
  inscricaoId?: string;
  respondido?: boolean;
}

export interface ListProvaTokensResponse {
  data: ProvaToken[];
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface ProvaTokenResponse {
  data: ProvaToken;
}

// Certificados
export type CertificadoStatus = "EMITIDO" | "CANCELADO" | "REVOGADO";

export interface CertificadoModeloResumo {
  id: string;
  nome: string;
  ativo?: boolean;
  versao?: number;
  default?: boolean;
}

export interface CertificadoCursoResumo {
  id: string;
  nome: string;
}

export interface CertificadoTurmaResumo {
  id: string;
  nome: string;
  codigo?: string;
}

export interface CertificadoAlunoResumo {
  id: string;
  nome?: string;
  email?: string;
  cpf?: string;
  codigoMatricula?: string;
  avatarUrl?: string;
}

export interface CertificadoEmitidoPorResumo {
  id: string;
  nome?: string;
  email?: string;
}

export interface TurmaCertificado {
  id: string;
  codigo?: string;
  numero?: string;
  status?: CertificadoStatus | string;
  emitidoEm: string;
  turmaId?: string;
  alunoId?: string;
  cursoId?: string;
  inscricaoId?: string;
  tipo?: string;
  formato?: string;
  cargaHoraria?: number;
  assinaturaUrl?: string | null;
  observacoes?: string | null;
  modelo?: CertificadoModeloResumo | null;
  curso?: CertificadoCursoResumo | null;
  turma?: CertificadoTurmaResumo | null;
  aluno?: CertificadoAlunoResumo | null;
  emitidoPor?: CertificadoEmitidoPorResumo | null;
  conteudoProgramatico?: string | null;
  conteudoProgramaticoAtualizadoEm?: string | null;
  pdfUrl?: string | null;
  previewUrl?: string | null;
  templateId?: string;
}

export interface ListCertificadosGlobalParams {
  search?: string;
  cursoId?: string;
  turmaId?: string;
  status?: CertificadoStatus | string;
  emitidoDe?: string;
  emitidoA?: string;
  page?: number;
  pageSize?: number;
  sortBy?: "alunoNome" | "emitidoEm" | "status" | "codigo";
  sortDir?: "asc" | "desc";
}

export interface ListCertificadosResponse {
  items: TurmaCertificado[];
  pagination?: Pagination;
}

export interface CreateCertificadoPayload {
  alunoId: string;
  cursoId?: string;
  turmaId?: string;
  modeloId?: string;
  forcarReemissao?: boolean;
  conteudoProgramatico?: string | null;
}

// Alunos
export interface AlunoComInscricao {
  id: string;
  codigo?: string;
  nomeCompleto?: string;
  email?: string;
  cpf?: string;
  telefone?: string;
  cidade?: string;
  estado?: string;
  status?: string;
  ultimoLogin?: string | null;
  criadoEm?: string;
  ultimoCurso?: {
    inscricaoId: string;
    statusInscricao: StatusInscricao | string;
    dataInscricao?: string;
    turma?: {
      id: string;
      nome: string;
      codigo?: string;
      status?: string;
    };
    curso?: {
      id: string;
      nome: string;
      codigo?: string;
    };
  } | null;
}

export interface ListAlunosComInscricaoParams {
  page?: number;
  limit?: number;
  status?: string | string[];
  search?: string;
  cursoId?: string | string[];
  turmaId?: string | string[];
  cidade?: string | string[];
}

export interface ListAlunosComInscricaoResponse {
  data: AlunoComInscricao[];
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// Curso Aluno
export interface CursoAlunoDetalhes {
  id: string;
  nome: string;
  nomeCompleto?: string;
  codigo?: string;
  email: string;
  cpf?: string;
  telefone?: string;
  cidade?: string;
  estado?: string;
  status?: string;
  ultimoLogin?: string | null;
  criadoEm: string;
  ultimoCurso?: {
    inscricaoId: string;
    statusInscricao: string;
    progresso?: number;
  };
  descricao?: string | null;
  avatarUrl?: string | null;
  atualizadoEm?: string | null;
  curriculosResumo?: {
    total: number;
    principalId?: string | null;
  };
  enderecos: CursoAlunoEndereco[];
  inscricoes: CursoAlunoInscricao[];
  totalInscricoes: number;
}

export interface CursoAlunoEndereco {
  id: string;
  cep?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
}

export interface CursoAlunoInscricao {
  id: string;
  statusInscricao?: string;
  status?: string;
  progresso?: number;
  criadoEm?: string;
  dataInscricao?: string;
  turma?: CursoAlunoTurmaResumo;
  curso?: CursoAlunoCursoResumo;
}

export interface CursoAlunoTurmaResumo {
  id: string;
  nome: string;
  codigo?: string;
  status?: string;
  dataInicio?: string;
  dataFim?: string;
}

export interface CursoAlunoCursoResumo {
  id: string;
  nome: string;
  codigo?: string;
  imagemUrl?: string | null;
}

export interface CursoAlunoEstatisticas {
  totalInscricoes: number;
  cursosConcluidos: number;
  cursosEmAndamento: number;
}

export interface CursoAlunoDetalhesResponse {
  success: boolean;
  data: CursoAlunoDetalhes;
}

export interface CursoAlunoEntrevistasParams {
  page?: number;
  pageSize?: number;
  statusEntrevista?: string[] | string;
  modalidades?: string[] | string;
  dataInicio?: string;
  dataFim?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export interface CursoAlunoEntrevistasResponse {
  items: EntrevistaOverviewItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface CursoAlunoEntrevistaOpcaoItem {
  candidaturaId: string;
  empresa: {
    id: string;
    nomeExibicao?: string | null;
    anonima?: boolean;
    labelExibicao?: string | null;
  } | null;
  vaga: {
    id: string;
    codigo?: string | null;
    titulo: string;
    status?: string | null;
  } | null;
  candidato: {
    id: string;
    codigo?: string | null;
    nome: string;
  } | null;
  entrevistaAtiva: boolean;
  entrevistaAtivaId?: string | null;
  empresaAnonima?: boolean;
  anonimatoBloqueado?: boolean;
  enderecoPadraoEntrevista?: EntrevistaEndereco | null;
}

export interface CursoAlunoEntrevistaOpcoesResponse
  extends EntrevistaOverviewCapabilities {
  google?: EntrevistaGoogleCapability | null;
  items: CursoAlunoEntrevistaOpcaoItem[];
}

export interface CursoAlunoCreateEntrevistaPayload {
  candidaturaId: string;
  modalidade: EntrevistaModalidade;
  dataInicio: string;
  dataFim: string;
  descricao?: string | null;
  empresaAnonima?: boolean;
  enderecoPresencial?: EntrevistaEndereco | null;
}

export type CursoAlunoCreateEntrevistaResponse = EntrevistaCreateResponseItem;

// Visão Geral
export interface VisaoGeralResponse {
  success: boolean;
  data: VisaoGeralData;
}

export interface VisaoGeralData {
  metricasGerais: VisaoGeralMetricasGerais;
  faturamento: VisaoGeralFaturamento;
  performance: VisaoGeralPerformance;
  proximosInicios: CursosProximosInicio[];
}

export interface VisaoGeralMetricasGerais {
  totalCursos: number;
  totalTurmas: number;
  totalInscricoes: number;
  totalAlunos: number;
}

export interface VisaoGeralFaturamento {
  total: number;
  cursos: CursoFaturamento[];
}

export interface CursoFaturamento {
  cursoId: number;
  nome: string;
  faturamento: number;
}

export type VisaoGeralFaturamentoPeriod =
  | "day"
  | "week"
  | "month"
  | "year"
  | "custom";

export interface VisaoGeralFaturamentoHistoricalPoint
  extends Record<string, string | number> {
  date: string; // day: YYYY-MM-DDTHH:00:00 | week/month/custom: YYYY-MM-DD | year: YYYY-MM
  faturamento: number;
  transacoes: number;
  transacoesAprovadas: number;
  cursos: number;
}

export interface VisaoGeralFaturamentoTopCurso {
  cursoId: string | number;
  cursoNome: string;
  cursoCodigo?: string;
  totalFaturamento: number;
  totalTransacoes: number;
  transacoesAprovadas: number;
  transacoesPendentes: number;
  ultimaTransacao?: string;
}

export interface VisaoGeralFaturamentoTendenciasData {
  period: VisaoGeralFaturamentoPeriod;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  faturamentoMesAtual: number;
  faturamentoMesAnterior: number;
  totalTransacoes: number;
  transacoesAprovadas: number;
  cursosAtivos: number;
  historicalData: VisaoGeralFaturamentoHistoricalPoint[];
  topCursosFaturamento: VisaoGeralFaturamentoTopCurso[];
  cursoMaiorFaturamento?: VisaoGeralFaturamentoTopCurso;
}

export interface VisaoGeralFaturamentoTendenciasResponse {
  success: boolean;
  data: VisaoGeralFaturamentoTendenciasData;
  message?: string;
}

export interface VisaoGeralPerformance {
  taxaConclusao: number;
  cursos: CursoPerformance[];
}

export interface CursoPerformance {
  cursoId: number;
  nome: string;
  taxaConclusao: number;
}

export interface CursosProximosInicio {
  cursoId: number;
  nome: string;
  turmas: TurmaProximoInicio[];
}

export interface TurmaProximoInicio {
  turmaId: string;
  nome: string;
  dataInicio: string;
}

export interface CursoTaxaConclusao {
  cursoId: number;
  nome: string;
  taxaConclusao: number;
}

// Inscrições Curso
export interface ListInscricoesCursoParams {
  page?: number;
  pageSize?: number;
  status?: string | string[];
  statusPagamento?: string | string[];
  includeProgress?: boolean;
  search?: string;
  turmaId?: string | string[];
  cidade?: string | string[];
}

export interface GetTurmaByIdParams {
  includeAlunos?: boolean;
  includeEstrutura?: boolean;
}

export interface ListTurmasParams {
  page?: number;
  pageSize?: number;
}

export interface ListInscricoesCursoResponse {
  data: InscricaoCurso[];
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// Auditoria
export interface CursoAuditoriaItem {
  id: string;
  campo: string;
  valorAntigo: any;
  valorNovo: any;
  descricao: string;
  criadoEm: string;
  alteradoPor: {
    id: string;
    nomeCompleto: string;
    email: string;
    role: string;
  };
}

export interface ListCursoAuditoriaParams {
  page?: number;
  pageSize?: number;
}

export interface ListCursoAuditoriaResponse {
  data: CursoAuditoriaItem[];
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// Estágio
export interface TurmaEstagio {
  id: string;
  turmaId: string;
  alunoId: string;
  status: string;
  inicioPrevisto?: string;
  fimPrevisto?: string;
  empresa?: string;
  cargo?: string;
  criadoEm?: string;
  atualizadoEm?: string;
  aluno?: {
    id: string;
    nomeCompleto: string;
    email: string;
  };
}

export interface CreateEstagioPayload {
  empresaNome: string;
  empresaTelefone: string;
  cep: string;
  rua: string;
  numero: string;
  dataInicioPrevista: string; // yyyy-mm-dd
  dataFimPrevista: string; // yyyy-mm-dd
  horarioInicio: string; // HH:mm
  horarioFim: string; // HH:mm
}

// ===================================
// FREQUÊNCIA (API Real)
// ===================================

export type FrequenciaStatus =
  | "PRESENTE"
  | "AUSENTE"
  | "JUSTIFICADO"
  | "ATRASADO"
  | "PENDENTE";
export type FrequenciaOrigemTipo = "AULA" | "PROVA" | "ATIVIDADE";
export type FrequenciaModoLancamento = "MANUAL" | "AUTOMATICO";

export interface FrequenciaAcao {
  podeMarcarPresente?: boolean;
  podeMarcarAusente?: boolean;
  podeEditar?: boolean;
  podeVerHistorico?: boolean;
  bloqueado?: boolean;
  motivoBloqueio?: string | null;
}

export interface Frequencia {
  id: string | null;
  syntheticId?: string | null;
  isPersisted?: boolean;
  cursoId: string;
  turmaId: string;
  aulaId?: string | null;
  alunoId?: string | null;
  alunoNome?: string | null;
  tipoOrigem?: FrequenciaOrigemTipo;
  origemId?: string | null;
  origemTitulo?: string | null;
  inscricaoId: string;
  status: FrequenciaStatus;
  modoLancamento?: FrequenciaModoLancamento;
  minutosPresenca?: number | null;
  minimoMinutosParaPresenca?: number | null;
  evidencia?: {
    acessou?: boolean;
    primeiroAcessoEm?: string | null;
    ultimoAcessoEm?: string | null;
    minutosEngajados?: number | null;
    respondeu?: boolean;
    statusSugerido?: FrequenciaStatus;
  } | null;
  lancadoPor?: {
    id: string;
    nome: string;
  } | null;
  lancadoEm?: string | null;
  justificativa?: string | null;
  observacoes?: string | null;
  dataReferencia?: string;
  criadoEm: string;
  atualizadoEm?: string;
  naturalKey?: {
    inscricaoId: string;
    tipoOrigem: FrequenciaOrigemTipo;
    origemId: string;
  };
  acaoFrequencia?: FrequenciaAcao;
  aluno?: {
    id?: string;
    nome?: string;
    nomeCompleto?: string;
    codigo?: string | null;
    cpf?: string | null;
    avatarUrl?: string | null;
  };
}

export interface FrequenciaResumoItem {
  alunoId: string;
  alunoNome: string;
  alunoCodigo?: string;
  totalAulas: number;
  presencas: number;
  ausencias: number;
  atrasados: number;
  justificadas: number;
  taxaPresencaPct: number;
}

export interface FrequenciaResumoResponse {
  success: boolean;
  data: {
    totalAulasNoPeriodo: number;
    items: FrequenciaResumoItem[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface ListFrequenciasParams {
  cursoId?: string;
  turmaIds?: string;
  aulaId?: string;
  tipoOrigem?: FrequenciaOrigemTipo;
  origemId?: string;
  inscricaoId?: string;
  search?: string;
  status?: FrequenciaStatus;
  dataInicio?: string;
  dataFim?: string;
  orderBy?: "atualizadoEm" | "status" | "tipoOrigem";
  order?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface ListFrequenciasResponse {
  success?: boolean;
  data:
    | Frequencia[]
    | {
        items: Frequencia[];
        pagination?: Pagination;
      };
  pagination?: Pagination;
}

export interface ListFrequenciaResumoParams {
  periodo?: "TOTAL" | "DIA" | "SEMANA" | "MES";
  anchorDate?: string; // YYYY-MM-DD
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateFrequenciaPayload {
  inscricaoId: string;
  aulaId?: string;
  tipoOrigem?: FrequenciaOrigemTipo;
  origemId?: string;
  status: FrequenciaStatus;
  modoLancamento?: FrequenciaModoLancamento;
  minutosPresenca?: number;
  minimoMinutosParaPresenca?: number;
  justificativa?: string | null;
  observacoes?: string | null;
  dataReferencia?: string;
}

export interface UpsertFrequenciaLancamentoPayload {
  inscricaoId: string;
  tipoOrigem: FrequenciaOrigemTipo;
  origemId: string;
  status: FrequenciaStatus;
  justificativa?: string | null;
  observacoes?: string | null;
  modoLancamento?: FrequenciaModoLancamento;
}

export interface UpsertFrequenciaLancamentoByAlunoPayload
  extends UpsertFrequenciaLancamentoPayload {
  cursoId: string;
  turmaId: string;
}

export interface UpdateFrequenciaPayload {
  status: FrequenciaStatus;
  tipoOrigem?: FrequenciaOrigemTipo;
  origemId?: string;
  modoLancamento?: FrequenciaModoLancamento;
  minutosPresenca?: number;
  minimoMinutosParaPresenca?: number;
  justificativa?: string | null;
  observacoes?: string | null;
}

export interface FrequenciaHistoryActor {
  id?: string | null;
  nome?: string | null;
  role?: string | null;
  roleLabel?: string | null;
}

export interface FrequenciaHistoryEntry {
  id: string;
  fromStatus?: FrequenciaStatus | null;
  toStatus: FrequenciaStatus;
  motivo?: string | null;
  fromMotivo?: string | null;
  toMotivo?: string | null;
  changedAt: string;
  actor?: FrequenciaHistoryActor | null;
  actorId?: string | null;
  actorName?: string | null;
  actorRole?: string | null;
  overrideReason?: string | null;
  // Contrato de auditoria (estágios) - compatível com legado
  frequenciaId?: string | null;
  evento?: string | null;
  deStatus?: FrequenciaStatus | null;
  paraStatus?: FrequenciaStatus | null;
  deMotivo?: string | null;
  paraMotivo?: string | null;
  dataReferencia?: string | null;
  createdAt?: string | null;
  ator?: {
    usuarioId?: string | null;
    nome?: string | null;
    email?: string | null;
    perfil?: string | null;
    perfilLabel?: string | null;
  } | null;
  seguranca?: {
    ip?: string | null;
    userAgent?: string | null;
    origem?: string | null;
  } | null;
}

export interface ListFrequenciaHistoricoByNaturalKeyParams {
  inscricaoId: string;
  tipoOrigem: FrequenciaOrigemTipo;
  origemId: string;
}

export interface ListFrequenciaHistoricoByAlunoNaturalKeyParams
  extends ListFrequenciaHistoricoByNaturalKeyParams {
  cursoId: string;
  turmaId: string;
}

// ===================================
// NOTAS (API Real)
// ===================================

export type NotaOrigemTipo = "PROVA" | "ATIVIDADE" | "AULA" | "OUTRO" | "SISTEMA";
export type NotaHistoryAction = "ADDED" | "REMOVED";
export type NotaHistoricoAcao =
  | "NOTA_MANUAL_ADICIONADA"
  | "NOTA_MANUAL_ATUALIZADA"
  | "NOTA_MANUAL_EXCLUIDA";

export interface NotaOrigem {
  tipo: NotaOrigemTipo;
  id?: string | null;
  titulo?: string | null;
}

export interface NotaHistoryEvent {
  id: string;
  action: NotaHistoryAction;
  at: string;
  nota: number;
  origem?: NotaOrigem | string | null;
  motivo?: string | null;
  alteradoPor?: {
    id?: string;
    nome?: string;
    role?: string;
    roleLabel?: string;
  } | null;
}

export interface NotaHistoricoActor {
  id?: string | null;
  nome?: string | null;
  role?: string | null;
  roleLabel?: string | null;
}

export interface NotaHistoricoSnapshot {
  notaId?: string | null;
  cursoId?: string | null;
  turmaId?: string | null;
  inscricaoId?: string | null;
  alunoId?: string | null;
  tipo?: string | null;
  provaId?: string | null;
  referenciaExterna?: string | null;
  titulo?: string | null;
  descricao?: string | null;
  nota?: number | null;
  peso?: number | null;
  valorMaximo?: number | null;
  dataReferencia?: string | null;
  observacoes?: string | null;
  criadoEm?: string | null;
  atualizadoEm?: string | null;
}

export interface NotaHistoricoItem {
  id: string;
  acao: NotaHistoricoAcao;
  dataHora: string;
  ator?: NotaHistoricoActor | null;
  descricao?: string | null;
  dadosAnteriores?: NotaHistoricoSnapshot | null;
  dadosNovos?: NotaHistoricoSnapshot | null;
}

export interface NotaLancamento {
  id?: string;
  notaId?: string | null;
  historicoNotaId?: string | null;
  historicoDisponivel?: boolean;
  cursoId: string;
  turmaId: string;
  inscricaoId: string;
  alunoId: string;
  alunoNome: string;
  nota: number | null;
  criadoEm?: string;
  atualizadoEm: string;
  motivo?: string | null;
  origem?: NotaOrigem | null;
  isManual: boolean;
  history?: NotaHistoryEvent[];
}

export interface ListNotasParams {
  turmaIds?: string; // CSV de IDs
  cursoId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  orderBy?: "alunoNome" | "nota" | "atualizadoEm";
  order?: "asc" | "desc";
}

export interface ListNotasResponse {
  success: boolean;
  data: {
    items: NotaLancamento[];
    pagination: {
      page: number;
      requestedPage?: number;
      pageSize: number;
      total: number;
      totalPages: number;
      hasNext?: boolean;
      hasPrevious?: boolean;
      isPageAdjusted?: boolean;
    };
  };
}

export interface GetNotaHistoricoResponse {
  success?: boolean;
  data?: {
    notaId?: string;
    items?: NotaHistoricoItem[];
  };
  items?: NotaHistoricoItem[];
}

export interface CreateNotaPayload {
  alunoId: string;
  nota: number;
  motivo: string;
  origem?: NotaOrigem | null;
}

export interface DeleteNotasParams {
  alunoId: string;
}

// ===================================
// AVALIAÇÕES (Biblioteca Global)
// ===================================

export type AvaliacaoTipo = "PROVA" | "ATIVIDADE";
export type AvaliacaoTipoAtividade = "QUESTOES" | "PERGUNTA_RESPOSTA";
export type AvaliacaoStatus = "RASCUNHO" | "PUBLICADA" | "EM_ANDAMENTO" | "CONCLUIDA" | "CANCELADA";
export type AvaliacaoModalidade = "ONLINE" | "PRESENCIAL" | "AO_VIVO" | "LIVE" | "SEMIPRESENCIAL";
export type AvaliacaoQuestaoTipo = "MULTIPLA_ESCOLHA" | "TEXTO" | "ANEXO";

// Alternativa para criação (sem IDs)
export interface AvaliacaoAlternativaInput {
  texto: string;
  correta: boolean;
}

// Alternativa retornada pela API (com IDs)
export interface AvaliacaoAlternativa {
  id: string;
  questaoId: string;
  texto: string;
  ordem: number;
  correta: boolean;
}

// Questão para criação (sem IDs)
export interface AvaliacaoQuestaoInput {
  enunciado: string;
  tipo: AvaliacaoQuestaoTipo;
  obrigatoria?: boolean;
  alternativas: AvaliacaoAlternativaInput[];
}

// Questão retornada pela API (com IDs)
export interface AvaliacaoQuestao {
  id: string;
  provaId: string;
  enunciado: string;
  tipo: AvaliacaoQuestaoTipo;
  ordem: number;
  peso?: number | null;
  obrigatoria: boolean;
  alternativas?: AvaliacaoAlternativa[];
}

// Legado - manter para compatibilidade
export interface AvaliacaoQuestaoLegacy {
  id: string;
  titulo: string;
  alternativas: { id: string; texto: string }[];
  respostaCorreta: string;
}

export interface Avaliacao {
  id: string;
  codigo?: string;
  cursoId: string;
  turmaId?: string | null;
  tipo: AvaliacaoTipo;
  tipoAtividade?: AvaliacaoTipoAtividade | null;
  titulo: string;
  descricao?: string;
  etiqueta?: string;
  status: AvaliacaoStatus;
  modalidade: AvaliacaoModalidade;
  instrutorId?: string | null;
  obrigatoria: boolean;
  moduloId?: string | null;
  dataInicio?: string;
  dataFim?: string;
  horaInicio?: string; // Formato HH:mm
  horaTermino?: string; // Formato HH:mm
  duracaoMinutos?: number;
  valeNota: boolean;
  peso?: number;
  valePonto: boolean;
  recuperacaoFinal?: boolean;
  valorRecuperacaoFinal?: number;
  questoes?: AvaliacaoQuestao[] | AvaliacaoQuestaoLegacy[];
  criadoPorId?: string;
  criadoEm: string;
  atualizadoEm?: string;
  ativo?: boolean;
  localizacao?: "TURMA" | "MODULO";
  ordem?: number;
  // Campos de visão geral (retornados pela API)
  nome?: string; // Alias de titulo
  // curso pode ser string (legado) ou objeto { id, codigo, nome }
  curso?: string | { id: string; codigo: string; nome: string } | null;
  cursoNome?: string | null; // Alias de curso.nome
  // turma pode ser string (legado) ou objeto { id, codigo, nome, modalidade? }
  turma?:
    | string
    | {
        id: string;
        codigo: string;
        nome: string;
        modalidade?: string;
        instrutorId?: string | null;
        instrutor?: {
          id?: string;
          nome?: string;
        } | null;
      }
    | null;
  turmaNome?: string | null; // Alias de turma.nome
  // instrutor pode ser objeto completo
  instrutor?: {
    id: string;
    nome: string;
    email: string;
    role: string;
  } | null;
  data?: string; // Alias de criadoEm
  pesoNota?: number; // Alias de peso
  criadoPor?: {
    nome: string | null;
    avatarUrl: string | null;
    cpf: string | null;
  } | null;
}

export interface ListAvaliacoesParams {
  page?: number;
  pageSize?: number;
  // Busca
  search?: string;
  titulo?: string;
  // Curso/Turma/Instrutor
  cursoId?: string;
  curso?: string; // texto
  turmaId?: string;
  turma?: string; // texto
  instrutorId?: string;
  instrutor?: string; // texto
  // Filtros
  tipo?: AvaliacaoTipo;
  tipoAtividade?: AvaliacaoTipoAtividade;
  modalidade?: AvaliacaoModalidade | string; // API aceita CSV
  status?: AvaliacaoStatus | string; // API aceita CSV
  obrigatoria?: boolean;
  semTurma?: boolean;
  includeSemCurso?: boolean;
  // Período
  dataInicio?: string;
  dataFim?: string;
  periodoInicio?: string;
  periodoFim?: string;
  periodo?: string; // "YYYY-MM-DD,YYYY-MM-DD"
  // Ordenação
  orderBy?: "criadoEm" | "titulo" | "ordem" | "dataInicio" | string;
  order?: "asc" | "desc";
}

export interface ListAvaliacoesResponse {
  success: boolean;
  data: Avaliacao[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateAvaliacaoPayload {
  // Campos obrigatórios (POST/PUT)
  tipo: AvaliacaoTipo;
  titulo: string;
  modalidade: AvaliacaoModalidade;
  obrigatoria: boolean;
  valePonto: boolean;
  dataInicio: string; // YYYY-MM-DD
  dataFim: string; // YYYY-MM-DD
  horaInicio: string; // HH:mm
  horaTermino: string; // HH:mm

  // Campos opcionais
  cursoId?: string | null;
  turmaId?: string | null;
  instrutorId?: string | null;
  etiqueta?: string;
  descricao?: string | null; // PERGUNTA_RESPOSTA (até 5000 chars)
  tipoAtividade?: AvaliacaoTipoAtividade; // Obrigatório quando tipo=ATIVIDADE
  peso?: number; // Obrigatório quando valePonto=true (0..10)
  duracaoMinutos?: number;
  recuperacaoFinal?: boolean; // Apenas para PROVA

  // Questões - obrigatório para PROVA e ATIVIDADE tipo QUESTOES (1..10)
  questoes?: AvaliacaoQuestaoInput[];
}

export type UpdateAvaliacaoPayload = Partial<CreateAvaliacaoPayload> & {
  status?: AvaliacaoStatus;
};

export interface CloneAvaliacaoPayload {
  avaliacaoId: string;
}

// ===================================
// ESTÁGIOS (Visão geral, detalhe e frequência)
// ===================================

export type EstagioStatus =
  | "PLANEJADO"
  | "EM_ANDAMENTO"
  | "ENCERRADO"
  | "CANCELADO"
  | "PENDENTE"
  | "CONCLUIDO"
  | "APROVADO"
  | "REPROVADO";

export type EstagioModoAlocacao = "TODOS" | "ESPECIFICOS";
export type EstagioPeriodicidade = "DIAS_SEMANA" | "INTERVALO";
export type EstagioTurno = "MANHA" | "TARDE" | "NOITE" | "PERSONALIZADO";
export type EstagioTipoParticipacao = "INICIAL" | "RECICLAGEM";
export type EstagioEmpresaVinculoModo = "CADASTRADA" | "MANUAL";
export type EstagioAlunoStatus =
  | "PENDENTE"
  | "EM_ANDAMENTO"
  | "CONCLUIDO"
  | "REPROVADO"
  | "CANCELADO";
export type EstagioFrequenciaStatus = "PRESENTE" | "AUSENTE" | "PENDENTE";

export interface EstagioPeriodo {
  periodicidade: EstagioPeriodicidade;
  diasSemana?: Array<"SEG" | "TER" | "QUA" | "QUI" | "SEX" | "SAB">;
  dataInicio: string;
  dataFim: string;
  incluirSabados?: boolean;
}

export interface EstagioHorario {
  horaInicio: string;
  horaFim: string;
}

export interface EstagioEmpresaEndereco {
  rua: string;
  cep: string;
  cidade: string;
  estado: string;
  numero: string;
  complemento: string;
}

export interface EstagioEmpresa {
  vinculoModo: EstagioEmpresaVinculoModo;
  empresaId?: string | null;
  nome?: string | null;
  cnpj?: string | null;
  telefone?: string | null;
  email?: string | null;
  endereco: EstagioEmpresaEndereco;
}

export interface EstagioGrupo {
  id: string;
  estagioId: string;
  nome: string;
  turno?: EstagioTurno | null;
  capacidade?: number | null;
  horaInicio?: string | null;
  horaFim?: string | null;
  alunosVinculados?: number | null;
  empresaId?: string | null;
  empresaNome?: string | null;
  supervisorNome?: string | null;
  contatoSupervisor?: string | null;
}

export interface EstagioAluno {
  id: string;
  estagioId: string;
  grupoId?: string | null;
  inscricaoId: string;
  alunoId: string;
  alunoNome?: string | null;
  alunoEmail?: string | null;
  alunoCpf?: string | null;
  avatarUrl?: string | null;
  codigoInscricao?: string | null;
  tipoParticipacao?: EstagioTipoParticipacao;
  status?: EstagioAlunoStatus;
  validadeAte?: string | null;
  percentualFrequencia?: number | null;
  diasObrigatorios?: number | null;
  diasPresentes?: number | null;
  diasAusentes?: number | null;
}

export interface EstagioResumo {
  totalAlunosVinculados?: number;
  concluidos?: number;
  pendentes?: number;
  mediaFrequencia?: number;
  totalLancamentosFrequencia?: number;
}

export interface Estagio {
  id: string;
  titulo?: string;
  descricao?: string | null;
  cursoId: string;
  cursoNome?: string | null;
  turmaId: string;
  turmaNome?: string | null;
  turmaCodigo?: string | null;
  obrigatorio?: boolean;
  modoAlocacao?: EstagioModoAlocacao;
  usarGrupos?: boolean;
  status: EstagioStatus;
  periodo?: EstagioPeriodo;
  diasObrigatorios?: number | null;
  cargaHorariaMinutos?: number | null;
  horarioPadrao?: EstagioHorario | null;
  empresa?: EstagioEmpresa | null;
  totalAlunosVinculados?: number;
  atualizadoEm?: string;
  criadoEm?: string;
  grupos?: EstagioGrupo[];
  alunos?: EstagioAluno[];
  calendarioObrigatorio?: string[];
  resumo?: EstagioResumo;
  // Campos legados (mantidos para retrocompatibilidade)
  inscricaoId?: string;
  alunoId?: string;
  empresaNome?: string;
  empresaTelefone?: string;
  cep?: string;
  rua?: string;
  numero?: string;
  dataInicioPrevista?: string;
  dataFimPrevista?: string;
  horarioInicio?: string;
  horarioFim?: string;
  compareceu?: boolean | null;
  aprovado?: boolean | null;
  observacoes?: string | null;
  aluno?: {
    id?: string;
    nomeCompleto?: string;
    email?: string;
  };
}

export interface ListEstagiosParams {
  cursoId?: string;
  turmaId?: string;
  turmaIds?: string;
  empresaId?: string;
  status?: EstagioStatus;
  obrigatorio?: boolean;
  periodo?: string;
  search?: string;
  orderBy?: "atualizadoEm" | "titulo" | "status";
  order?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface ListEstagiosResponse {
  success: boolean;
  data:
    | Estagio[]
    | {
        items: Estagio[];
        pagination?: Pagination;
      };
  pagination?: Pagination;
}

export interface CreateEstagioGroupPayload {
  nome: string;
  turno?: EstagioTurno;
  capacidade?: number;
  horaInicio?: string;
  horaFim?: string;
}

export interface CreateEstagioEmpresaPayload {
  vinculoModo: EstagioEmpresaVinculoModo;
  empresaId?: string;
  nome?: string;
  cnpj?: string;
  telefone?: string;
  email?: string;
  endereco: EstagioEmpresaEndereco;
}

export interface CreateEstagioGlobalPayload {
  titulo: string;
  descricao?: string;
  cursoId: string;
  turmaId: string;
  obrigatorio?: boolean;
  modoAlocacao: EstagioModoAlocacao;
  usarGrupos?: boolean;
  periodo: EstagioPeriodo;
  horarioPadrao?: EstagioHorario;
  cargaHorariaMinutos?: number;
  empresa?: CreateEstagioEmpresaPayload;
  grupos?: CreateEstagioGroupPayload[];
}

export interface UpdateEstagioGlobalPayload
  extends Partial<CreateEstagioGlobalPayload> {
  status?: EstagioStatus;
}

export interface VincularAlunosEstagioPayload {
  modo: EstagioModoAlocacao;
  inscricaoIds?: string[];
  grupoIdDefault?: string | null;
  tipoParticipacao?: EstagioTipoParticipacao;
}

export interface AlocarAlunoEstagioGrupoPayload {
  grupoId: string | null;
}

export interface ListEstagioFrequenciasParams {
  data?: string;
  status?: EstagioFrequenciaStatus;
  grupoId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface ListEstagioFrequenciasPeriodoParams {
  dataInicio?: string;
  dataFim?: string;
  status?: EstagioFrequenciaStatus;
  grupoId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface EstagioFrequencia {
  id: string | null;
  estagioId: string;
  estagioAlunoId: string;
  alunoId: string;
  alunoNome: string;
  alunoCpf?: string | null;
  alunoCodigo?: string | null;
  codigoMatricula?: string | null;
  avatarUrl?: string | null;
  inscricaoId?: string;
  codigoInscricao?: string | null;
  grupoId?: string | null;
  grupoNome?: string | null;
  dataReferencia: string;
  status: EstagioFrequenciaStatus;
  motivo?: string | null;
  atualizadoEm?: string | null;
  criadoEm?: string | null;
}

export interface EstagioFrequenciasPeriodoGroup {
  data: string;
  items: EstagioFrequencia[];
}

export interface EstagioFrequenciasPeriodoMeta {
  dataInicio?: string | null;
  dataFim?: string | null;
  totalDatas?: number | null;
}

export interface EstagioFrequenciasPeriodoResponse {
  gruposPorData: EstagioFrequenciasPeriodoGroup[];
  pagination?: Pagination;
  periodo?: EstagioFrequenciasPeriodoMeta;
}

export interface ListEstagioFrequenciaHistoricoParams {
  page?: number;
  pageSize?: number;
}

export interface EstagioFrequenciaHistoryActor {
  usuarioId?: string | null;
  nome?: string | null;
  email?: string | null;
  perfil?: string | null;
  perfilLabel?: string | null;
}

export interface EstagioFrequenciaHistorySeguranca {
  ip?: string | null;
  userAgent?: string | null;
  origem?: string | null;
}

export interface EstagioFrequenciaHistoricoResponse {
  items: FrequenciaHistoryEntry[];
  pagination?: Pagination;
}

export interface UpsertEstagioFrequenciaPayload {
  estagioAlunoId: string;
  dataReferencia: string;
  status: Exclude<EstagioFrequenciaStatus, "PENDENTE">;
  motivo?: string;
}

export interface ConcluirEstagioAlunoResponse {
  id: string;
  status: EstagioAlunoStatus;
  conclusaoEm: string;
  validadeAte: string;
  percentualFrequencia: number;
  elegivelCertificado: boolean;
}

export interface UpdateEstagioStatusPayload {
  status: EstagioStatus;
  compareceu?: boolean;
  observacoes?: string;
}

// ===================================
// CERTIFICADOS (Atualizado)
// ===================================

export interface Certificado {
  id: string;
  codigo: string;
  cursoId: string;
  turmaId: string;
  inscricaoId: string;
  alunoId: string;
  emitidoEm: string;
  pdfUrl?: string;
  templateId?: string;
}

export interface CertificadoVerificacao {
  id: string;
  codigo: string;
  valido: boolean;
  aluno: string;
  curso: string;
  cargaHoraria: number;
  emitidoEm: string;
}

// ===================================
// AGENDA
// ===================================

export type AgendaEventoTipo =
  | "AULA"
  | "PROVA"
  | "ATIVIDADE"
  | "ANIVERSARIO"
  | "TURMA_INICIO"
  | "TURMA_FIM";

export type AulaModalidade = "ONLINE" | "PRESENCIAL" | "AO_VIVO" | "SEMIPRESENCIAL";

export interface AgendaEvento {
  id: string;
  tipo: AgendaEventoTipo;
  titulo: string;
  descricao?: string;
  dataInicio?: string;
  dataFim?: string;
  data?: string;
  cor?: string;
  cursoId?: string | null;
  turmaId?: string | null;
  aulaId?: string | null;
  avaliacaoId?: string | null;
  modalidade?: AulaModalidade;
  meetUrl?: string;
}

export interface ListAgendaParams {
  dataInicio?: string;
  dataFim?: string;
  turmaId?: string;
  tipo?: AgendaEventoTipo;
}

// ===================================
// CHECKOUT
// ===================================

export interface CheckoutPayload {
  cursoId: string;
  turmaId: string;
  alunoId: string;
  email: string;
  nome: string;
}

export interface CheckoutResponse {
  success: boolean;
  data: {
    checkoutUrl: string;
    paymentId: string;
    preferenceId: string;
  };
}

export interface CheckoutPagamentoStatus {
  paymentId: string;
  status: string;
  statusDetail: string;
  valor: number;
  cursoId: string;
  turmaId: string;
}

export interface VagasDisponiveis {
  vagasTotais: number;
  vagasOcupadas: number;
  vagasDisponiveis: number;
  temVagas: boolean;
}

// ===================================
// MATERIAIS DE AULA
// ===================================

export type MaterialTipo = "ARQUIVO" | "LINK" | "TEXTO";

export interface AulaMaterial {
  id: string;
  aulaId: string;
  tipo: MaterialTipo;
  titulo: string;
  descricao?: string;
  obrigatorio: boolean;
  ordem: number;
  arquivoUrl?: string;
  arquivoNome?: string;
  arquivoTamanho?: number;
  arquivoMimeType?: string;
  linkUrl?: string;
  conteudoHtml?: string;
}

export interface CreateMaterialPayload {
  titulo: string;
  descricao?: string;
  tipo: MaterialTipo;
  obrigatorio?: boolean;
  arquivoUrl?: string;
  arquivoNome?: string;
  arquivoTamanho?: number;
  arquivoMimeType?: string;
  linkUrl?: string;
  conteudoHtml?: string;
}

export type UpdateMaterialPayload = Partial<CreateMaterialPayload>;

export interface ReordenarMateriaisPayload {
  ordens: Array<{ id: string; ordem: number }>;
}

// ===================================
// CATEGORIAS
// ===================================

export interface Subcategoria {
  id: string;
  nome: string;
}

export interface Categoria {
  id: string;
  nome: string;
  descricao?: string;
  icone?: string;
  cor?: string;
  subcategorias?: Subcategoria[];
}

// ===================================
// PAGINAÇÃO GENÉRICA
// ===================================

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: Pagination;
}

export interface ApiResponse<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
