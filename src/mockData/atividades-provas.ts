/**
 * Mock de atividades e provas para seleção no Builder (turmas -> estrutura)
 * TODO: substituir por listagem real de `/api/v1/cursos/.../provas` e atividades
 */

export type MockAvaliacaoModalidade =
  | "ONLINE"
  | "PRESENCIAL"
  | "LIVE"
  | "SEMIPRESENCIAL";

export type MockAtividadeProva = {
  id: string;
  codigo: string;
  titulo: string;
  tipo: "ATIVIDADE" | "PROVA";
  modalidade: MockAvaliacaoModalidade;
  inicio: string; // ISO
  fim: string; // ISO
  status: "RASCUNHO" | "PUBLICADA";
};

export const MOCK_ATIVIDADES_PROVAS: MockAtividadeProva[] = [
  {
    id: "av-1",
    codigo: "ATV-0001",
    titulo: "Atividade 01 - Fixação",
    tipo: "ATIVIDADE",
    modalidade: "ONLINE",
    inicio: "2025-12-23T00:00:00.000Z",
    fim: "2025-12-24T23:59:59.999Z",
    status: "PUBLICADA",
  },
  {
    id: "av-2",
    codigo: "ATV-0002",
    titulo: "Atividade 02 - Prática",
    tipo: "ATIVIDADE",
    modalidade: "PRESENCIAL",
    inicio: "2025-12-25T00:00:00.000Z",
    fim: "2025-12-25T23:59:59.999Z",
    status: "RASCUNHO",
  },
  {
    id: "av-3",
    codigo: "PRO-0001",
    titulo: "Prova 01",
    tipo: "PROVA",
    modalidade: "LIVE",
    inicio: "2025-12-26T00:00:00.000Z",
    fim: "2025-12-26T23:59:59.999Z",
    status: "PUBLICADA",
  },
  {
    id: "av-4",
    codigo: "PRO-0002",
    titulo: "Prova 02",
    tipo: "PROVA",
    modalidade: "ONLINE",
    inicio: "2025-12-27T00:00:00.000Z",
    fim: "2025-12-28T23:59:59.999Z",
    status: "RASCUNHO",
  },
];

