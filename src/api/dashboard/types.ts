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

