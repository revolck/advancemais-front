/**
 * Tipos para API de Dashboard - Visão Geral da Plataforma
 */

export interface PlataformaMetricasGerais {
  // Cursos
  totalCursos: number;
  cursosPublicados: number;
  cursosRascunho: number;
  totalTurmas: number;
  turmasAtivas: number;
  turmasInscricoesAbertas: number;

  // Usuários
  totalUsuarios: number;
  totalAlunos: number;
  totalAlunosAtivos: number;
  totalAlunosInscritos: number;
  totalAlunosConcluidos: number;
  totalInstrutores: number;
  totalInstrutoresAtivos: number;
  totalCandidatos: number;
  totalCandidatosAtivos: number;

  // Empresas
  totalEmpresas: number;
  empresasAtivas: number;
  empresasBloqueadas: number;
  empresasPendentes: number;

  // Vagas
  totalVagas: number;
  vagasPublicadas: number;
  vagasEmAnalise: number;
  vagasEncerradas: number;

  // Financeiro
  faturamentoMesAtual: number;
  faturamentoMesAnterior: number;
  totalTransacoes: number;
  transacoesAprovadas: number;
  transacoesPendentes: number;
}

export interface PlataformaUsuariosStats {
  porTipo: {
    alunos: number;
    instrutores: number;
    empresas: number;
    candidatos: number;
    admins: number;
    moderadores: number;
  };
  porStatus: {
    ativos: number;
    inativos: number;
    bloqueados: number;
    pendentes: number;
  };
  crescimentoMensal: Array<{
    mes: string;
    total: number;
    novos: number;
  }>;
}

export interface PlataformaCursosStats {
  porStatus: {
    publicados: number;
    rascunho: number;
    despublicados: number;
  };
  porCategoria: Array<{
    categoria: string;
    total: number;
  }>;
  crescimentoMensal: Array<{
    mes: string;
    total: number;
    novos: number;
  }>;
}

export interface PlataformaEmpresasStats {
  porStatus: {
    ativas: number;
    bloqueadas: number;
    pendentes: number;
    inativas: number;
  };
  porPlano: Array<{
    plano: string;
    total: number;
  }>;
  crescimentoMensal: Array<{
    mes: string;
    total: number;
    novas: number;
  }>;
}

export interface PlataformaVagasStats {
  porStatus: {
    publicadas: number;
    emAnalise: number;
    encerradas: number;
    pausadas: number;
  };
  crescimentoMensal: Array<{
    mes: string;
    total: number;
    novas: number;
  }>;
}

export interface PlataformaFaturamentoStats {
  porMes: Array<{
    mes: string;
    faturamento: number;
    transacoes: number;
    aprovadas: number;
  }>;
  porCategoria: Array<{
    categoria: string;
    faturamento: number;
  }>;
  topCursos: Array<{
    cursoId: string;
    cursoNome: string;
    cursoCodigo: string;
    faturamento: number;
  }>;
}

export interface PlataformaOverviewData {
  metricasGerais: PlataformaMetricasGerais;
  usuarios: PlataformaUsuariosStats;
  cursos: PlataformaCursosStats;
  empresas: PlataformaEmpresasStats;
  vagas: PlataformaVagasStats;
  faturamento: PlataformaFaturamentoStats;
}

export interface PlataformaOverviewResponse {
  success: boolean;
  data: PlataformaOverviewData;
  message?: string;
}

export type DashboardFinanceiroPeriodo =
  | "7d"
  | "30d"
  | "90d"
  | "12m"
  | "month"
  | "custom";

export type DashboardFinanceiroAgruparPor = "day" | "week" | "month";
export type DashboardFinanceiroTendencia = "up" | "down" | "stable";

export interface DashboardFinanceiroParams {
  periodo?: DashboardFinanceiroPeriodo;
  mesReferencia?: string;
  dataInicio?: string;
  dataFim?: string;
  agruparPor?: DashboardFinanceiroAgruparPor;
  timezone?: string;
  ultimasTransacoesLimit?: number;
}

export interface DashboardFinanceiroFiltroAplicado {
  periodo?: DashboardFinanceiroPeriodo | null;
  mesReferencia?: string | null;
  dataInicio?: string | null;
  dataFim?: string | null;
  agruparPor?: DashboardFinanceiroAgruparPor | null;
  timezone?: string | null;
}

export interface DashboardFinanceiroCardMonetario {
  valor: number;
  valorFormatado?: string | null;
  variacaoPercentual?: number | null;
  tendencia?: DashboardFinanceiroTendencia | null;
}

export interface DashboardFinanceiroCardContador {
  valor: number;
  variacaoPercentual?: number | null;
  tendencia?: DashboardFinanceiroTendencia | null;
}

export interface DashboardFinanceiroCards {
  receitaBruta: DashboardFinanceiroCardMonetario;
  receitaLiquida: DashboardFinanceiroCardMonetario;
  ticketMedio: DashboardFinanceiroCardMonetario;
  transacoesAprovadas: DashboardFinanceiroCardContador;
  transacoesPendentes: DashboardFinanceiroCardContador;
  estornosEReembolsos: DashboardFinanceiroCardMonetario;
}

export interface DashboardFinanceiroEvolucaoReceitaItem {
  label: string;
  valor: number;
  valorFormatado?: string | null;
  quantidade?: number | null;
}

export interface DashboardFinanceiroEvolucaoTransacoesItem {
  label: string;
  aprovadas: number;
  pendentes: number;
  recusadas: number;
}

export interface DashboardFinanceiroDistribuicaoStatusItem {
  value: string;
  label: string;
  count: number;
  percentual?: number | null;
}

export interface DashboardFinanceiroDistribuicaoValorItem {
  value: string;
  label: string;
  count: number;
  valor: number;
  valorFormatado?: string | null;
}

export interface DashboardFinanceiroGraficos {
  evolucaoReceita: DashboardFinanceiroEvolucaoReceitaItem[];
  evolucaoTransacoes: DashboardFinanceiroEvolucaoTransacoesItem[];
  distribuicaoPorStatus: DashboardFinanceiroDistribuicaoStatusItem[];
  distribuicaoPorTipo: DashboardFinanceiroDistribuicaoValorItem[];
  distribuicaoPorGateway: DashboardFinanceiroDistribuicaoValorItem[];
}

export interface DashboardFinanceiroRankingItem {
  position: number;
  name: string;
  value: number;
  valorFormatado?: string | null;
}

export interface DashboardFinanceiroRankings {
  topCursos: DashboardFinanceiroRankingItem[];
  topPlanos: DashboardFinanceiroRankingItem[];
  topEmpresas: DashboardFinanceiroRankingItem[];
  topAlunos: DashboardFinanceiroRankingItem[];
}

export interface DashboardFinanceiroAssinaturas {
  ativas: number;
  novasNoPeriodo: number;
  canceladasNoPeriodo: number;
  renovacoesNoPeriodo: number;
  receitaAssinaturas: number;
  receitaAssinaturasFormatada?: string | null;
  taxaRetencao: number;
}

export interface DashboardFinanceiroUltimaTransacao {
  id: string;
  codigoExibicao?: string | null;
  tipo: string;
  tipoLabel?: string | null;
  status: string;
  statusLabel?: string | null;
  valor: number;
  valorFormatado?: string | null;
  gateway?: string | null;
  gatewayLabel?: string | null;
  descricao?: string | null;
  criadoEm: string;
}

export interface DashboardFinanceiroAcoesRapidas {
  detalhesTransacoesUrl?: string | null;
  detalhesAssinaturasUrl?: string | null;
}

export interface DashboardFinanceiroData {
  filtrosAplicados: DashboardFinanceiroFiltroAplicado;
  cards: DashboardFinanceiroCards;
  graficos: DashboardFinanceiroGraficos;
  rankings: DashboardFinanceiroRankings;
  assinaturas: DashboardFinanceiroAssinaturas;
  ultimasTransacoes: DashboardFinanceiroUltimaTransacao[];
  acoesRapidas?: DashboardFinanceiroAcoesRapidas | null;
}

export interface DashboardFinanceiroResponse {
  success: boolean;
  data: DashboardFinanceiroData;
  message?: string;
}

export interface DashboardFinanceiroFiltroOption {
  value: string;
  label: string;
}

export interface DashboardFinanceiroFiltrosData {
  periodos: DashboardFinanceiroFiltroOption[];
  agruparPor: DashboardFinanceiroFiltroOption[];
}

export interface DashboardFinanceiroFiltrosResponse {
  success: boolean;
  data: DashboardFinanceiroFiltrosData;
  message?: string;
}
