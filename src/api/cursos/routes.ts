/**
 * Rotas para API de Cursos (catálogo, turmas, aulas, avaliações, etc.)
 */

const BASE = "/api/v1/cursos" as const;

export const cursosRoutes = {
  base: () => BASE,
  meta: () => `${BASE}/meta`,
  alunos: {
    list: () => `${BASE}/alunos`,
    get: (alunoId: string) => `${BASE}/alunos/${alunoId}`,
    update: (alunoId: string) => `${BASE}/alunos/${alunoId}`,
  },
  cursos: {
    list: () => `${BASE}`,
    create: () => `${BASE}`,
    get: (cursoId: number | string) => `${BASE}/${cursoId}`,
    update: (cursoId: number | string) => `${BASE}/${cursoId}`,
    delete: (cursoId: number | string) => `${BASE}/${cursoId}`,
    inscricoes: {
      list: (cursoId: number | string) => `${BASE}/${cursoId}/inscricoes`,
    },
    auditoria: {
      list: (cursoId: number | string) => `${BASE}/${cursoId}/auditoria`,
    },
    turmas: {
      list: (cursoId: number | string) => `${BASE}/${cursoId}/turmas`,
      create: (cursoId: number | string) => `${BASE}/${cursoId}/turmas`,
      get: (cursoId: number | string, turmaId: string) =>
        `${BASE}/${cursoId}/turmas/${turmaId}`,
      update: (cursoId: number | string, turmaId: string) =>
        `${BASE}/${cursoId}/turmas/${turmaId}`,
      aulas: {
        list: (cursoId: number | string, turmaId: string) =>
          `${BASE}/${cursoId}/turmas/${turmaId}/aulas`,
        create: (cursoId: number | string, turmaId: string) =>
          `${BASE}/${cursoId}/turmas/${turmaId}/aulas`,
        get: (cursoId: number | string, turmaId: string, aulaId: string) =>
          `${BASE}/${cursoId}/turmas/${turmaId}/aulas/${aulaId}`,
        update: (cursoId: number | string, turmaId: string, aulaId: string) =>
          `${BASE}/${cursoId}/turmas/${turmaId}/aulas/${aulaId}`,
        delete: (cursoId: number | string, turmaId: string, aulaId: string) =>
          `${BASE}/${cursoId}/turmas/${turmaId}/aulas/${aulaId}`,
      },
      agenda: {
        list: (cursoId: number | string, turmaId: string) =>
          `${BASE}/${cursoId}/turmas/${turmaId}/agenda`,
        create: (cursoId: number | string, turmaId: string) =>
          `${BASE}/${cursoId}/turmas/${turmaId}/agenda`,
        get: (cursoId: number | string, turmaId: string, agendaId: string) =>
          `${BASE}/${cursoId}/turmas/${turmaId}/agenda/${agendaId}`,
        update: (cursoId: number | string, turmaId: string, agendaId: string) =>
          `${BASE}/${cursoId}/turmas/${turmaId}/agenda/${agendaId}`,
        delete: (cursoId: number | string, turmaId: string, agendaId: string) =>
          `${BASE}/${cursoId}/turmas/${turmaId}/agenda/${agendaId}`,
      },
      inscricoes: {
        list: (cursoId: number | string, turmaId: string) =>
          `${BASE}/${cursoId}/turmas/${turmaId}/inscricoes`,
        create: (cursoId: number | string, turmaId: string) =>
          `${BASE}/${cursoId}/turmas/${turmaId}/inscricoes`,
        delete: (cursoId: number | string, turmaId: string, alunoId: string) =>
          `${BASE}/${cursoId}/turmas/${turmaId}/inscricoes/${alunoId}`,
      },
      modulos: {
        list: (cursoId: number | string, turmaId: string) =>
          `${BASE}/${cursoId}/turmas/${turmaId}/modulos`,
        create: (cursoId: number | string, turmaId: string) =>
          `${BASE}/${cursoId}/turmas/${turmaId}/modulos`,
        get: (cursoId: number | string, turmaId: string, moduloId: string) =>
          `${BASE}/${cursoId}/turmas/${turmaId}/modulos/${moduloId}`,
        update: (cursoId: number | string, turmaId: string, moduloId: string) =>
          `${BASE}/${cursoId}/turmas/${turmaId}/modulos/${moduloId}`,
        delete: (cursoId: number | string, turmaId: string, moduloId: string) =>
          `${BASE}/${cursoId}/turmas/${turmaId}/modulos/${moduloId}`,
      },
      provas: {
        list: (cursoId: number | string, turmaId: string) =>
          `${BASE}/${cursoId}/turmas/${turmaId}/provas`,
        create: (cursoId: number | string, turmaId: string) =>
          `${BASE}/${cursoId}/turmas/${turmaId}/provas`,
        get: (cursoId: number | string, turmaId: string, provaId: string) =>
          `${BASE}/${cursoId}/turmas/${turmaId}/provas/${provaId}`,
        update: (cursoId: number | string, turmaId: string, provaId: string) =>
          `${BASE}/${cursoId}/turmas/${turmaId}/provas/${provaId}`,
        delete: (cursoId: number | string, turmaId: string, provaId: string) =>
          `${BASE}/${cursoId}/turmas/${turmaId}/provas/${provaId}`,
        notas: (cursoId: number | string, turmaId: string, provaId: string) =>
          `${BASE}/${cursoId}/turmas/${turmaId}/provas/${provaId}/notas`, // PUT
      },
      notas: {
        list: (cursoId: number | string, turmaId: string) =>
          `${BASE}/${cursoId}/turmas/${turmaId}/notas`,
        create: (cursoId: number | string, turmaId: string) =>
          `${BASE}/${cursoId}/turmas/${turmaId}/notas`,
        get: (cursoId: number | string, turmaId: string, notaId: string) =>
          `${BASE}/${cursoId}/turmas/${turmaId}/notas/${notaId}`,
        update: (cursoId: number | string, turmaId: string, notaId: string) =>
          `${BASE}/${cursoId}/turmas/${turmaId}/notas/${notaId}`,
        delete: (cursoId: number | string, turmaId: string, notaId: string) =>
          `${BASE}/${cursoId}/turmas/${turmaId}/notas/${notaId}`,
      },
      frequencias: {
        list: (cursoId: number | string, turmaId: string) =>
          `${BASE}/${cursoId}/turmas/${turmaId}/frequencias`,
        create: (cursoId: number | string, turmaId: string) =>
          `${BASE}/${cursoId}/turmas/${turmaId}/frequencias`,
        get: (
          cursoId: number | string,
          turmaId: string,
          frequenciaId: string
        ) => `${BASE}/${cursoId}/turmas/${turmaId}/frequencias/${frequenciaId}`,
        update: (
          cursoId: number | string,
          turmaId: string,
          frequenciaId: string
        ) => `${BASE}/${cursoId}/turmas/${turmaId}/frequencias/${frequenciaId}`,
        delete: (
          cursoId: number | string,
          turmaId: string,
          frequenciaId: string
        ) => `${BASE}/${cursoId}/turmas/${turmaId}/frequencias/${frequenciaId}`,
      },
      certificados: {
        list: (cursoId: number | string, turmaId: string) =>
          `${BASE}/${cursoId}/turmas/${turmaId}/certificados`,
        create: (cursoId: number | string, turmaId: string) =>
          `${BASE}/${cursoId}/turmas/${turmaId}/certificados`,
      },
      regrasAvaliacao: {
        get: (cursoId: number | string, turmaId: string) =>
          `${BASE}/${cursoId}/turmas/${turmaId}/regras-avaliacao`,
        update: (cursoId: number | string, turmaId: string) =>
          `${BASE}/${cursoId}/turmas/${turmaId}/regras-avaliacao`,
      },
      recuperacoes: {
        create: (cursoId: number | string, turmaId: string) =>
          `${BASE}/${cursoId}/turmas/${turmaId}/recuperacoes`,
      },
      admin: {
        inscricoes: {
          estagios: {
            list: (
              cursoId: number | string,
              turmaId: string,
              inscricaoId: string
            ) =>
              `${BASE}/${cursoId}/turmas/${turmaId}/inscricoes/${inscricaoId}/estagios`,
            create: (
              cursoId: number | string,
              turmaId: string,
              inscricaoId: string
            ) =>
              `${BASE}/${cursoId}/turmas/${turmaId}/inscricoes/${inscricaoId}/estagios`,
          },
        },
      },
    },
  },
  me: {
    agenda: () => `${BASE}/me/agenda`,
    certificados: () => `${BASE}/me/certificados`,
    inscricoes: {
      certificados: (inscricaoId: string) =>
        `${BASE}/me/inscricoes/${inscricaoId}/certificados`,
      estagios: (inscricaoId: string) =>
        `${BASE}/me/inscricoes/${inscricaoId}/estagios`,
      frequenciasDetalhadas: (inscricaoId: string) =>
        `${BASE}/me/inscricoes/${inscricaoId}/frequencias-detalhadas`,
      notas: (inscricaoId: string) =>
        `${BASE}/me/inscricoes/${inscricaoId}/notas`,
      notasDetalhadas: (inscricaoId: string) =>
        `${BASE}/me/inscricoes/${inscricaoId}/notas-detalhadas`,
    },
  },
  publico: {
    cursos: () => `${BASE}/publico/cursos`,
    curso: (cursoId: number | string) => `${BASE}/publico/cursos/${cursoId}`,
    turma: (turmaId: string) => `${BASE}/publico/turmas/${turmaId}`,
  },
  estagios: {
    get: (estagioId: string) => `${BASE}/estagios/${estagioId}`,
    update: (estagioId: string) => `${BASE}/estagios/${estagioId}`,
    resendConfirm: (estagioId: string) =>
      `${BASE}/estagios/${estagioId}/reenviar-confirmacao`,
    updateStatus: (estagioId: string) => `${BASE}/estagios/${estagioId}/status`,
    confirmByToken: (token: string) => `${BASE}/estagios/confirmacoes/${token}`,
  },
  admin: {
    alunos: {
      list: () => `${BASE}/alunos`,
      get: (alunoId: string) => `${BASE}/alunos/${alunoId}`,
    },
    inscricoes: {
      list: () => `${BASE}/inscricoes`,
      certificados: (inscricaoId: string) =>
        `${BASE}/inscricoes/${inscricaoId}/certificados`,
      frequenciasDetalhadas: (inscricaoId: string) =>
        `${BASE}/inscricoes/${inscricaoId}/frequencias-detalhadas`,
      notas: (inscricaoId: string) => `${BASE}/inscricoes/${inscricaoId}/notas`,
      notasDetalhadas: (inscricaoId: string) =>
        `${BASE}/inscricoes/${inscricaoId}/notas-detalhadas`,
    },
  },
  certificados: {
    verificarPorCodigo: (codigo: string) =>
      `${BASE}/certificados/codigo/${codigo}`,
  },
  visaoGeral: () => `${BASE}/visaogeral`,
} as const;

export default cursosRoutes;
