export interface InstrutorOverviewMetricasGerais {
  totalAlunos: number;
  totalProvas: number;
  totalNotasPendentes: number;
  totalNotasLancadas: number;
  totalCursos: number;
  totalTurmas: number;
  totalAulas: number;
  totalEventosAgenda: number;
}

export interface InstrutorOverviewCardsAlunos {
  total: number;
  ativos: number;
}

export interface InstrutorOverviewCardsProvas {
  total: number;
  pendentesCorrecao: number;
}

export interface InstrutorOverviewCardsNotas {
  pendentes: number;
  lancadas: number;
}

export interface InstrutorOverviewCardsCursos {
  total: number;
}

export interface InstrutorOverviewCardsAulas {
  total: number;
  hoje: number;
}

export interface InstrutorOverviewCardsAgenda {
  eventos: number;
  proximos7Dias: number;
}

export interface InstrutorOverviewCards {
  alunos: InstrutorOverviewCardsAlunos;
  provas: InstrutorOverviewCardsProvas;
  notas: InstrutorOverviewCardsNotas;
  cursos: InstrutorOverviewCardsCursos;
  aulas: InstrutorOverviewCardsAulas;
  agenda: InstrutorOverviewCardsAgenda;
}

export interface InstrutorOverviewStatusAlunos {
  ativos: number;
  inativos: number;
  total: number;
}

export interface InstrutorOverviewStatusProvas {
  abertas: number;
  encerradas: number;
  total: number;
}

export interface InstrutorOverviewStatusNotas {
  pendentes: number;
  concluidas: number;
  total: number;
}

export interface InstrutorOverviewStatusAulas {
  agendadas: number;
  realizadas: number;
  total: number;
}

export interface InstrutorOverviewStatusPorCategoria {
  alunos: InstrutorOverviewStatusAlunos;
  provas: InstrutorOverviewStatusProvas;
  notas: InstrutorOverviewStatusNotas;
  aulas: InstrutorOverviewStatusAulas;
}

export interface InstrutorOverviewData {
  metricasGerais: InstrutorOverviewMetricasGerais;
  cards: InstrutorOverviewCards;
  statusPorCategoria: InstrutorOverviewStatusPorCategoria;
  atualizadoEm: string | null;
}

export interface InstrutorOverviewResponse {
  success: boolean;
  data: InstrutorOverviewData;
}
