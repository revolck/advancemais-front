/**
 * Mock Data - Dados de exemplo para atividades e provas
 * Centralizado para fácil substituição por chamadas de API
 */

export interface PlatformActivity {
  value: string;
  label: string;
}

export interface PlatformExam {
  value: string;
  label: string;
}

/**
 * Atividades mockadas da plataforma
 * TODO: Substituir por chamada de API quando disponível
 */
export const MOCK_ACTIVITIES: PlatformActivity[] = [
  {
    value: "act-001",
    label: "Quiz de Matemática Básica",
  },
  {
    value: "act-002",
    label: "Exercícios de Excel Avançado",
  },
  {
    value: "act-003",
    label: "Teste de Lógica de Programação",
  },
  {
    value: "act-004",
    label: "Atividade Prática - PowerBI",
  },
  {
    value: "act-005",
    label: "Questionário de Gestão de Projetos",
  },
];

/**
 * Provas mockadas da plataforma
 * TODO: Substituir por chamada de API quando disponível
 */
export const MOCK_EXAMS: PlatformExam[] = [
  {
    value: "prova-001",
    label: "Prova de Matemática Básica",
  },
  {
    value: "prova-002",
    label: "Avaliação Final - Excel Avançado",
  },
  {
    value: "prova-003",
    label: "Teste de Conhecimentos - PowerBI",
  },
  {
    value: "prova-004",
    label: "Prova de Gestão de Projetos",
  },
  {
    value: "prova-005",
    label: "Exame de Certificação",
  },
];
