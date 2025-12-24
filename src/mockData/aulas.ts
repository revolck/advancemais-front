/**
 * Mock de aulas para seleção no Builder (turmas -> estrutura)
 * TODO: substituir por listagem real de `/api/v1/aulas`
 */

export type MockAula = {
  id: string;
  codigo: string;
  titulo: string;
  modalidade: "ONLINE" | "PRESENCIAL" | "LIVE" | "SEMIPRESENCIAL";
  duracaoMinutos: number;
  obrigatoria: boolean;
  status: "RASCUNHO" | "PUBLICADA";
};

export const MOCK_AULAS: MockAula[] = [
  {
    id: "aula-1",
    codigo: "AUL-0001",
    titulo: "Introdução ao curso",
    modalidade: "ONLINE",
    duracaoMinutos: 45,
    obrigatoria: true,
    status: "PUBLICADA",
  },
  {
    id: "aula-2",
    codigo: "AUL-0002",
    titulo: "Fundamentos (parte 1)",
    modalidade: "LIVE",
    duracaoMinutos: 60,
    obrigatoria: true,
    status: "PUBLICADA",
  },
  {
    id: "aula-3",
    codigo: "AUL-0003",
    titulo: "Fundamentos (parte 2)",
    modalidade: "LIVE",
    duracaoMinutos: 60,
    obrigatoria: false,
    status: "PUBLICADA",
  },
  {
    id: "aula-4",
    codigo: "AUL-0004",
    titulo: "Prática guiada",
    modalidade: "PRESENCIAL",
    duracaoMinutos: 90,
    obrigatoria: false,
    status: "RASCUNHO",
  },
];
