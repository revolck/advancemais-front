// Tipos básicos para Cursos
export interface Curso {
  id: string;
  nome: string;
  codigo: string;
  descricao: string;
  descricaoHtml?: string;
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
  vagasTotais?: number;
  vagasDisponiveis?: number;
  inscricoesCount?: number;
  vagasOcupadas?: number;
  vagasDisponiveisCalculadas?: number;
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
}

export interface CreateTurmaPayload {
  nome: string;
  instrutorId?: string;
  turno: "MANHA" | "TARDE" | "NOITE" | "INTEGRAL";
  metodo: "ONLINE" | "PRESENCIAL" | "LIVE" | "SEMIPRESENCIAL";
  vagasTotais: number;
  dataInicio?: string;
  dataFim?: string;
  dataInscricaoInicio?: string;
  dataInscricaoFim?: string;
  estrutura?: {
    modules: Array<{
      title: string;
      startDate?: string | null;
      endDate?: string | null;
      instructorId?: string | null;
      items: Array<{
        title: string;
        type: "AULA" | "PROVA" | "ATIVIDADE";
        startDate?: string | null;
        endDate?: string | null;
      }>;
    }>;
    standaloneItems?: Array<{
      title: string;
      type: "AULA" | "PROVA" | "ATIVIDADE";
      startDate?: string | null;
      endDate?: string | null;
    }>;
  };
}

// Inscrições
export interface TurmaInscricao {
  id: string;
  alunoId: string;
  status?: string;
  criadoEm?: string;
  observacoes?: string;
  aluno?: {
    id: string;
    nome?: string;
    nomeCompleto?: string;
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
  criadoEm: string;
  progresso: number;
  aluno: {
    id: string;
    nomeCompleto: string;
    email: string;
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
  titulo?: string;
  nome?: string;
  descricao?: string;
  tipo?: string;
  recuperacaoFinal?: boolean;
  status?: ProvaStatus;
  data?: string;
  dataInicio?: string;
  dataFim?: string;
  inicioPrevisto?: string;
  fimPrevisto?: string;
  etiqueta?: string;
  peso?: number;
  valeNota?: boolean;
  valePonto?: boolean;
  ativo?: boolean;
  localizacao?: "TURMA" | "MODULO";
  turmaId?: string;
  moduloId?: string;
  modalidade?: "ONLINE" | "PRESENCIAL" | "AO_VIVO" | "SEMIPRESENCIAL";
  instrutorId?: string;
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
export interface TurmaCertificado {
  id: string;
  turmaId: string;
  alunoId: string;
  emitidoEm: string;
}

export interface CreateCertificadoPayload {
  alunoId: string;
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
  search?: string;
  turmaId?: string | string[];
  cidade?: string | string[];
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

export type FrequenciaStatus = "PRESENTE" | "AUSENTE" | "JUSTIFICADO" | "ATRASADO";

export interface Frequencia {
  id: string;
  cursoId: string;
  turmaId: string;
  aulaId: string;
  inscricaoId: string;
  status: FrequenciaStatus;
  justificativa?: string | null;
  observacoes?: string | null;
  dataReferencia: string;
  criadoEm: string;
  aluno?: {
    id: string;
    nome: string;
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
  aulaId?: string;
  inscricaoId?: string;
  status?: FrequenciaStatus;
  dataInicio?: string;
  dataFim?: string;
  page?: number;
  pageSize?: number;
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
  aulaId: string;
  status: FrequenciaStatus;
  justificativa?: string | null;
  observacoes?: string | null;
  dataReferencia: string;
}

export interface UpdateFrequenciaPayload {
  status: FrequenciaStatus;
  justificativa?: string | null;
}

// ===================================
// NOTAS (API Real)
// ===================================

export type NotaOrigemTipo = "PROVA" | "ATIVIDADE" | "AULA" | "OUTRO";
export type NotaHistoryAction = "ADDED" | "REMOVED";

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
}

export interface NotaLancamento {
  cursoId: string;
  turmaId: string;
  inscricaoId: string;
  alunoId: string;
  alunoNome: string;
  nota: number | null;
  atualizadoEm: string;
  motivo?: string | null;
  origem?: NotaOrigem | null;
  isManual: boolean;
  history?: NotaHistoryEvent[];
}

export interface ListNotasParams {
  turmaIds: string; // CSV de IDs
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
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
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
  turma?: string | { id: string; codigo: string; nome: string; modalidade?: string } | null;
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
  cursoId?: string;
  turmaId?: string;
  semTurma?: boolean;
  tipo?: AvaliacaoTipo;
  status?: AvaliacaoStatus;
  search?: string;
  page?: number;
  pageSize?: number;
  orderBy?: string;
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
  // Campos obrigatórios
  cursoId: string;
  tipo: AvaliacaoTipo;
  titulo: string;
  peso: number; // 0 a 10, aceita decimais
  dataInicio: string; // YYYY-MM-DD
  dataFim: string; // YYYY-MM-DD
  horaInicio: string; // HH:mm
  horaTermino: string; // HH:mm

  // Campos opcionais
  turmaId?: string | null;
  instrutorId?: string | null;
  tipoAtividade?: AvaliacaoTipoAtividade; // Obrigatório quando tipo=ATIVIDADE
  descricao?: string; // Obrigatório quando tipoAtividade=PERGUNTA_RESPOSTA (máx 500 chars)
  etiqueta?: string;
  valeNota?: boolean;
  valePonto?: boolean; // Padrão: true
  modalidade?: AvaliacaoModalidade; // Herdada da turma se vinculada
  duracaoMinutos?: number;
  obrigatoria?: boolean; // Padrão: true
  status?: AvaliacaoStatus; // Padrão: RASCUNHO
  recuperacaoFinal?: boolean; // Apenas para PROVA, requer valePonto=true

  // Questões - obrigatório para PROVA e ATIVIDADE tipo QUESTOES (1 a 10 questões)
  questoes?: AvaliacaoQuestaoInput[];
}

export type UpdateAvaliacaoPayload = Partial<CreateAvaliacaoPayload>;

export interface CloneAvaliacaoPayload {
  avaliacaoId: string;
}

// ===================================
// ESTÁGIOS (Atualizado com listagem global)
// ===================================

export type EstagioStatus =
  | "PENDENTE"
  | "EM_ANDAMENTO"
  | "CONCLUIDO"
  | "APROVADO"
  | "REPROVADO"
  | "CANCELADO";

export interface Estagio {
  id: string;
  cursoId: string;
  turmaId: string;
  inscricaoId: string;
  alunoId: string;
  empresaNome: string;
  empresaTelefone?: string;
  cep: string;
  rua: string;
  numero: string;
  dataInicioPrevista: string;
  dataFimPrevista: string;
  horarioInicio: string;
  horarioFim: string;
  status: EstagioStatus;
  compareceu?: boolean | null;
  aprovado?: boolean | null;
  observacoes?: string | null;
  criadoEm: string;
  atualizadoEm?: string;
  aluno?: {
    id: string;
    nomeCompleto: string;
    email: string;
  };
}

export interface ListEstagiosParams {
  cursoId?: string;
  turmaId?: string;
  status?: EstagioStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface ListEstagiosResponse {
  success: boolean;
  data: Estagio[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
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
