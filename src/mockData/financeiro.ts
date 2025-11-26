/**
 * Mock Finance Data
 * TODO: Remover quando a API real estiver disponível
 */

export type FinanceiroStatus = "Pago" | "Programado" | "Em atraso";

export interface FinanceiroResumo {
  receitaMensal: number;
  crescimento: number; // %
  mrr: number;
  inadimplencia: number; // %
  ticketMedio: number;
  planosAtivos: number;
  alunosPagantes: number;
}

export interface FinanceiroTrendPoint {
  month: string;
  planos: number;
  cursos: number;
  despesas: number;
}

export interface FinanceiroDistribuicaoItem {
  name: string;
  value: number;
  color: string;
}

export interface FinanceiroPlanoEntry {
  empresa: string;
  plano: string;
  ciclo: "Mensal" | "Trimestral" | "Anual";
  mrr: number;
  equipe: number;
  status: "Ativo" | "Em renovação";
  renovacao: string;
}

export interface FinanceiroCursoEntry {
  curso: string;
  turmasAtivas: number;
  alunos: number;
  receita: number;
  crescimento: string;
}

export interface FinanceiroRecebimento {
  descricao: string;
  valor: number;
  vencimento: string;
  status: FinanceiroStatus;
}

export interface FinanceiroInadimplencia {
  cliente: string;
  valor: number;
  diasEmAtraso: number;
  plano: string;
  contato: string;
}

export interface FinanceiroMetas {
  metaMensal: number;
  realizado: number;
  pipeline: number;
}

export interface RankingItem {
  position: number;
  name: string;
  value: number;
}

export interface FinanceiroMockData {
  resumo: FinanceiroResumo;
  cashflowTrend: FinanceiroTrendPoint[];
  distribuicaoReceita: FinanceiroDistribuicaoItem[];
  planosEmpresariais: FinanceiroPlanoEntry[];
  cursosDestaque: FinanceiroCursoEntry[];
  proximosRecebimentos: FinanceiroRecebimento[];
  inadimplencias: FinanceiroInadimplencia[];
  metas: FinanceiroMetas;
  top5Cursos: RankingItem[];
  top5Planos: RankingItem[];
  top5Empresas: RankingItem[];
  top5Alunos: RankingItem[];
}

export const financeiroMockData: FinanceiroMockData = {
  resumo: {
    receitaMensal: 148_500,
    crescimento: 12.4,
    mrr: 54_200,
    inadimplencia: 3.1,
    ticketMedio: 1_880,
    planosAtivos: 72,
    alunosPagantes: 428,
  },
  cashflowTrend: [
    { month: "Jan", planos: 58_000, cursos: 18_000, despesas: 36_000 },
    { month: "Fev", planos: 61_500, cursos: 21_000, despesas: 37_500 },
    { month: "Mar", planos: 65_200, cursos: 23_800, despesas: 39_000 },
    { month: "Abr", planos: 66_400, cursos: 24_300, despesas: 40_200 },
    { month: "Mai", planos: 68_100, cursos: 27_500, despesas: 41_700 },
    { month: "Jun", planos: 70_800, cursos: 29_400, despesas: 42_300 },
    { month: "Jul", planos: 73_200, cursos: 32_100, despesas: 43_100 },
    { month: "Ago", planos: 74_900, cursos: 33_600, despesas: 44_500 },
  ],
  distribuicaoReceita: [
    { name: "Planos Enterprise", value: 48_000, color: "#4f46e5" },
    { name: "Planos Growth", value: 31_000, color: "#6366f1" },
    { name: "Cursos ao vivo", value: 24_500, color: "#a855f7" },
    { name: "Cursos gravados", value: 17_200, color: "#c084fc" },
    { name: "Serviços extras", value: 7_800, color: "#d8b4fe" },
  ],
  planosEmpresariais: [
    {
      empresa: "NeoTech Solutions",
      plano: "Enterprise",
      ciclo: "Anual",
      mrr: 12_800,
      equipe: 210,
      status: "Ativo",
      renovacao: "2025-01-12",
    },
    {
      empresa: "Horizonte Labs",
      plano: "Growth",
      ciclo: "Mensal",
      mrr: 4_900,
      equipe: 86,
      status: "Ativo",
      renovacao: "2024-09-05",
    },
    {
      empresa: "Atlas Educação",
      plano: "Enterprise",
      ciclo: "Anual",
      mrr: 9_600,
      equipe: 150,
      status: "Em renovação",
      renovacao: "2024-10-18",
    },
    {
      empresa: "Studio Move",
      plano: "Essencial",
      ciclo: "Mensal",
      mrr: 1_890,
      equipe: 45,
      status: "Ativo",
      renovacao: "2024-08-28",
    },
  ],
  cursosDestaque: [
    {
      curso: "Formação Fullstack",
      turmasAtivas: 3,
      alunos: 142,
      receita: 32_400,
      crescimento: "+18%",
    },
    {
      curso: "UX/UI Avançado",
      turmasAtivas: 2,
      alunos: 96,
      receita: 21_700,
      crescimento: "+9%",
    },
    {
      curso: "Power BI para Negócios",
      turmasAtivas: 4,
      alunos: 188,
      receita: 26_300,
      crescimento: "+24%",
    },
    {
      curso: "ESG para Empresas",
      turmasAtivas: 1,
      alunos: 54,
      receita: 10_900,
      crescimento: "+6%",
    },
  ],
  proximosRecebimentos: [
    {
      descricao: "NeoTech - Ciclo anual 24/25",
      valor: 12_800,
      vencimento: "2024-09-10",
      status: "Programado",
    },
    {
      descricao: "Licenças adicionais Horizonte Labs",
      valor: 4_200,
      vencimento: "2024-08-29",
      status: "Pago",
    },
    {
      descricao: "Renovação Atlas Educação",
      valor: 9_600,
      vencimento: "2024-10-01",
      status: "Programado",
    },
    {
      descricao: "Cursos In Company - Grupo Vertex",
      valor: 16_400,
      vencimento: "2024-09-18",
      status: "Programado",
    },
  ],
  inadimplencias: [
    {
      cliente: "Studio Move",
      valor: 1_890,
      diasEmAtraso: 18,
      plano: "Essencial",
      contato: "financeiro@studiomove.com",
    },
    {
      cliente: "Pleno Digital",
      valor: 3_200,
      diasEmAtraso: 9,
      plano: "Growth",
      contato: "cobranca@pleno.digital",
    },
    {
      cliente: "BaseFit Academy",
      valor: 970,
      diasEmAtraso: 32,
      plano: "Starter",
      contato: "contato@basefit.com",
    },
  ],
  metas: {
    metaMensal: 180_000,
    realizado: 148_500,
    pipeline: 26_800,
  },
  top5Cursos: [
    { position: 1, name: "Formação Fullstack", value: 32_400 },
    { position: 2, name: "Power BI para Negócios", value: 26_300 },
    { position: 3, name: "UX/UI Avançado", value: 21_700 },
    { position: 4, name: "Gestão de Projetos Ágil", value: 18_500 },
    { position: 5, name: "ESG para Empresas", value: 10_900 },
  ],
  top5Planos: [
    { position: 1, name: "Enterprise", value: 48_000 },
    { position: 2, name: "Growth", value: 31_000 },
    { position: 3, name: "Professional", value: 22_500 },
    { position: 4, name: "Essencial", value: 15_800 },
    { position: 5, name: "Starter", value: 8_200 },
  ],
  top5Empresas: [
    { position: 1, name: "NeoTech Solutions", value: 153_600 },
    { position: 2, name: "Atlas Educação", value: 115_200 },
    { position: 3, name: "Horizonte Labs", value: 58_800 },
    { position: 4, name: "Studio Move", value: 22_680 },
    { position: 5, name: "Pleno Digital", value: 38_400 },
  ],
  top5Alunos: [
    { position: 1, name: "Maria Silva", value: 12_800 },
    { position: 2, name: "João Santos", value: 9_600 },
    { position: 3, name: "Ana Costa", value: 7_200 },
    { position: 4, name: "Pedro Oliveira", value: 5_400 },
    { position: 5, name: "Carla Ferreira", value: 4_200 },
  ],
};


