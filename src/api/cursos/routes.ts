/**
 * Rotas para API de Cursos (catálogo, turmas, aulas, avaliações, etc.)
 * Atualizado para API v3
 */

const BASE = "/api/v1/cursos" as const;

export const cursosRoutes = {
  base: () => BASE,
  meta: () => `${BASE}/meta`,
  templates: {
    vincular: () => `${BASE}/templates/vincular`,
  },
  alunos: {
    list: () => `${BASE}/alunos`,
    get: (alunoId: string) => `${BASE}/alunos/${alunoId}`,
    update: (alunoId: string) => `${BASE}/alunos/${alunoId}`,
    notas: (alunoId: string) => `${BASE}/alunos/${alunoId}/notas`,
    estagios: {
      list: (alunoId: string) => `${BASE}/alunos/${alunoId}/estagios`,
      get: (alunoId: string, estagioId: string) =>
        `${BASE}/alunos/${alunoId}/estagios/${estagioId}`,
      frequencias: (alunoId: string, estagioId: string) =>
        `${BASE}/alunos/${alunoId}/estagios/${estagioId}/frequencias`,
      frequenciasPeriodo: (alunoId: string, estagioId: string) =>
        `${BASE}/alunos/${alunoId}/estagios/${estagioId}/frequencias/periodo`,
      lancamentos: (alunoId: string, estagioId: string) =>
        `${BASE}/alunos/${alunoId}/estagios/${estagioId}/frequencias/lancamentos`,
      historico: (alunoId: string, estagioId: string, frequenciaId: string) =>
        `${BASE}/alunos/${alunoId}/estagios/${estagioId}/frequencias/${frequenciaId}/historico`,
    },
    frequencias: {
      list: (alunoId: string) => `${BASE}/alunos/${alunoId}/frequencias`,
      lancamentos: (alunoId: string) =>
        `${BASE}/alunos/${alunoId}/frequencias/lancamentos`,
      historico: (alunoId: string, frequenciaId: string) =>
        `${BASE}/alunos/${alunoId}/frequencias/${frequenciaId}/historico`,
      historicoByNaturalKey: (alunoId: string) =>
        `${BASE}/alunos/${alunoId}/frequencias/historico`,
    },
  },
  cursos: {
    list: () => `${BASE}`,
    create: () => `${BASE}`,
    notasGlobal: () => `${BASE}/notas`,
    frequenciasGlobal: () => `${BASE}/frequencias`,
    get: (cursoId: number | string) => `${BASE}/${cursoId}`,
    update: (cursoId: number | string) => `${BASE}/${cursoId}`,
    delete: (cursoId: number | string) => `${BASE}/${cursoId}`,
    deleteDefinitivo: (cursoId: number | string) =>
      `${BASE}/${cursoId}/exclusao-definitiva`,
    meta: (cursoId: number | string) => `${BASE}/${cursoId}/meta`,
    notas: (cursoId: number | string) => `${BASE}/${cursoId}/notas`,
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
      delete: (cursoId: number | string, turmaId: string) =>
        `${BASE}/${cursoId}/turmas/${turmaId}`,
      publicar: (cursoId: number | string, turmaId: string) =>
        `${BASE}/${cursoId}/turmas/${turmaId}/publicar`,
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
        tokens: {
          list: (cursoId: number | string, turmaId: string, provaId: string) =>
            `${BASE}/${cursoId}/turmas/${turmaId}/provas/${provaId}/tokens`,
          create: (
            cursoId: number | string,
            turmaId: string,
            provaId: string
          ) => `${BASE}/${cursoId}/turmas/${turmaId}/provas/${provaId}/tokens`,
          get: (
            cursoId: number | string,
            turmaId: string,
            provaId: string,
            tokenId: string
          ) =>
            `${BASE}/${cursoId}/turmas/${turmaId}/provas/${provaId}/tokens/${tokenId}`,
          getByToken: (token: string) => `${BASE}/provas/tokens/${token}`,
        },
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
        historico: (cursoId: number | string, turmaId: string, notaId: string) =>
          `${BASE}/${cursoId}/turmas/${turmaId}/notas/${notaId}/historico`,
      },
      frequencias: {
        list: (cursoId: number | string, turmaId: string) =>
          `${BASE}/${cursoId}/turmas/${turmaId}/frequencias`,
        create: (cursoId: number | string, turmaId: string) =>
          `${BASE}/${cursoId}/turmas/${turmaId}/frequencias`,
        lancamentos: (cursoId: number | string, turmaId: string) =>
          `${BASE}/${cursoId}/turmas/${turmaId}/frequencias/lancamentos`,
        resumo: (cursoId: number | string, turmaId: string) =>
          `${BASE}/${cursoId}/turmas/${turmaId}/frequencias/resumo`,
        historico: (
          cursoId: number | string,
          turmaId: string,
          frequenciaId: string
        ) =>
          `${BASE}/${cursoId}/turmas/${turmaId}/frequencias/${frequenciaId}/historico`,
        historicoByNaturalKey: (cursoId: number | string, turmaId: string) =>
          `${BASE}/${cursoId}/turmas/${turmaId}/frequencias/historico`,
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
      avaliacoes: {
        clone: (cursoId: number | string, turmaId: string) =>
          `${BASE}/${cursoId}/turmas/${turmaId}/avaliacoes/clone`,
      },
      vagas: (cursoId: number | string, turmaId: string) =>
        `${BASE}/${cursoId}/turmas/${turmaId}/vagas`,
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
    list: () => `${BASE}/certificados`,
    create: () => `${BASE}/certificados`,
    get: (certificadoId: string) => `${BASE}/certificados/${certificadoId}`,
    preview: (certificadoId: string) =>
      `${BASE}/certificados/${certificadoId}/preview`,
    pdf: (certificadoId: string) => `${BASE}/certificados/${certificadoId}/pdf`,
    modelos: () => `${BASE}/certificados/modelos`,
    verificarPorCodigo: (codigo: string) =>
      `${BASE}/certificados/codigo/${codigo}`,
  },
  // Avaliações (biblioteca global)
  avaliacoes: {
    list: () => `${BASE}/avaliacoes`,
    create: () => `${BASE}/avaliacoes`,
    get: (avaliacaoId: string) => `${BASE}/avaliacoes/${avaliacaoId}`,
    questoes: (avaliacaoId: string) => `${BASE}/avaliacoes/${avaliacaoId}/questoes`,
    update: (avaliacaoId: string) => `${BASE}/avaliacoes/${avaliacaoId}`,
    delete: (avaliacaoId: string) => `${BASE}/avaliacoes/${avaliacaoId}`,
    publicar: (avaliacaoId: string) => `${BASE}/avaliacoes/${avaliacaoId}/publicar`,
    turmas: () => `${BASE}/avaliacoes/turmas`,
    instrutores: () => `${BASE}/avaliacoes/instrutores`,
  },
  // Aulas (biblioteca global)
  aulas: {
    list: () => `${BASE}/aulas`,
    create: () => `${BASE}/aulas`,
    get: (aulaId: string) => `${BASE}/aulas/${aulaId}`,
    update: (aulaId: string) => `${BASE}/aulas/${aulaId}`,
    delete: (aulaId: string) => `${BASE}/aulas/${aulaId}`,
    publicar: (aulaId: string) => `${BASE}/aulas/${aulaId}/publicar`,
    materiais: {
      list: (aulaId: string) => `${BASE}/aulas/${aulaId}/materiais`,
      create: (aulaId: string) => `${BASE}/aulas/${aulaId}/materiais`,
      update: (aulaId: string, materialId: string) =>
        `${BASE}/aulas/${aulaId}/materiais/${materialId}`,
      delete: (aulaId: string, materialId: string) =>
        `${BASE}/aulas/${aulaId}/materiais/${materialId}`,
      reordenar: (aulaId: string) =>
        `${BASE}/aulas/${aulaId}/materiais/reordenar`,
      gerarToken: (aulaId: string, materialId: string) =>
        `${BASE}/aulas/${aulaId}/materiais/${materialId}/gerar-token`,
    },
    progresso: (aulaId: string) => `${BASE}/aulas/${aulaId}/progresso`,
    presenca: (aulaId: string) => `${BASE}/aulas/${aulaId}/presenca`,
  },
  // Estágios (listagem global e status)
  estagiosGlobal: {
    list: () => `${BASE}/estagios`,
    create: () => `${BASE}/estagios`,
    get: (estagioId: string) => `${BASE}/estagios/${estagioId}`,
    update: (estagioId: string) => `${BASE}/estagios/${estagioId}`,
    updateStatus: (estagioId: string) =>
      `${BASE}/estagios/${estagioId}/status`,
    vincularAlunos: (estagioId: string) =>
      `${BASE}/estagios/${estagioId}/alunos/vincular`,
    alocarAlunoGrupo: (estagioId: string, estagioAlunoId: string) =>
      `${BASE}/estagios/${estagioId}/alunos/${estagioAlunoId}/grupo`,
    frequencias: (estagioId: string) => `${BASE}/estagios/${estagioId}/frequencias`,
    frequenciasPeriodo: (estagioId: string) =>
      `${BASE}/estagios/${estagioId}/frequencias/periodo`,
    upsertFrequenciaLancamento: (estagioId: string) =>
      `${BASE}/estagios/${estagioId}/frequencias/lancamentos`,
    frequenciaHistorico: (estagioId: string, frequenciaId: string) =>
      `${BASE}/estagios/${estagioId}/frequencias/${frequenciaId}/historico`,
    concluirAluno: (estagioId: string, estagioAlunoId: string) =>
      `${BASE}/estagios/${estagioId}/alunos/${estagioAlunoId}/concluir`,
  },
  // Checkout
  checkout: {
    iniciar: () => `${BASE}/checkout`,
    webhook: () => `${BASE}/checkout/webhook`,
    validarToken: (token: string) => `${BASE}/checkout/validar-token/${token}`,
    pagamento: (paymentId: string) => `${BASE}/checkout/pagamento/${paymentId}`,
  },
  // Agenda
  agenda: () => `${BASE}/agenda`,
  // Categorias
  categorias: {
    list: () => `${BASE}/categorias`,
    get: (categoriaId: string) => `${BASE}/categorias/${categoriaId}`,
  },
  visaoGeral: () => `${BASE}/visaogeral`,
  visaoGeralFaturamento: () => `${BASE}/visaogeral/faturamento`,
} as const;

export default cursosRoutes;
