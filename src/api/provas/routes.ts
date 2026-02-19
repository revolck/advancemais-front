/**
 * Rotas para API de Provas - Questões e Respostas
 */

const BASE = "/api/v1/cursos" as const;

export const provasRoutes = {
  questoes: {
    list: (cursoId: string | number, turmaId: string, provaId: string) =>
      `${BASE}/${cursoId}/turmas/${turmaId}/provas/${provaId}/questoes`,
    get: (cursoId: string | number, turmaId: string, provaId: string, questaoId: string) =>
      `${BASE}/${cursoId}/turmas/${turmaId}/provas/${provaId}/questoes/${questaoId}`,
    create: (cursoId: string | number, turmaId: string, provaId: string) =>
      `${BASE}/${cursoId}/turmas/${turmaId}/provas/${provaId}/questoes`,
    update: (cursoId: string | number, turmaId: string, provaId: string, questaoId: string) =>
      `${BASE}/${cursoId}/turmas/${turmaId}/provas/${provaId}/questoes/${questaoId}`,
    delete: (cursoId: string | number, turmaId: string, provaId: string, questaoId: string) =>
      `${BASE}/${cursoId}/turmas/${turmaId}/provas/${provaId}/questoes/${questaoId}`,
    responder: (cursoId: string | number, turmaId: string, provaId: string, questaoId: string) =>
      `${BASE}/${cursoId}/turmas/${turmaId}/provas/${provaId}/questoes/${questaoId}/responder`,
    corrigir: (cursoId: string | number, turmaId: string, provaId: string, questaoId: string) =>
      `${BASE}/${cursoId}/turmas/${turmaId}/provas/${provaId}/questoes/${questaoId}/corrigir`,
  },
  respostas: {
    list: (cursoId: string | number, turmaId: string, provaId: string) =>
      `${BASE}/${cursoId}/turmas/${turmaId}/provas/${provaId}/respostas`,
  },
  avaliacoes: {
    historico: () => `${BASE}/avaliacoes/historico`,
    respostas: {
      list: (avaliacaoId: string) => `${BASE}/avaliacoes/${avaliacaoId}/respostas`,
      get: (avaliacaoId: string, respostaId: string) =>
        `${BASE}/avaliacoes/${avaliacaoId}/respostas/${respostaId}`,
      corrigir: (avaliacaoId: string, respostaId: string) =>
        `${BASE}/avaliacoes/${avaliacaoId}/respostas/${respostaId}/correcao`,
    },
  },
} as const;


