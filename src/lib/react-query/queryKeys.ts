const createListKey =
  <T>(scope: string) =>
  (filters: T) =>
    [scope, filters] as const;

const createDetailKey =
  (scope: string) =>
  (id: string | number) =>
    [scope, String(id)] as const;

const createCompositeDetailKey =
  (scope: string) =>
  (...parts: Array<string | number>) =>
    [scope, ...parts.map(String)] as const;

const turmaDetailKey = createCompositeDetailKey("admin-turma-detail");

export const queryKeys = {
  usuarios: {
    list: createListKey<unknown>("admin-usuarios-list"),
    detail: createDetailKey("admin-usuario-detail"),
  },
  alunos: {
    list: createListKey<unknown>("admin-alunos-list"),
  },
  instrutores: {
    list: createListKey<unknown>("admin-instrutores-list"),
    detail: createDetailKey("admin-instrutor-detail"),
  },
  cursos: {
    detail: createDetailKey("admin-curso-detail"),
    list: createListKey<unknown>("admin-cursos-list"),
    categories: () => ["admin-cursos-categories"] as const,
    subcategories: (categoriaId: number | string) =>
      ["admin-cursos-subcategories", String(categoriaId)] as const,
    allSubcategories: () => ["admin-cursos-subcategories-all"] as const,
    listInscricoes: (cursoId: number | string, turmaId: string) =>
      ["admin-cursos-inscricoes", String(cursoId), turmaId] as const,
  },
  turmas: {
    list: createListKey<unknown>("admin-turmas-list"),
    detail: (cursoId: number | string, turmaId: string) =>
      turmaDetailKey(cursoId, turmaId),
  },
  candidatos: {
    detail: createDetailKey("admin-candidato-consolidated"),
    list: createListKey<unknown>("admin-candidatos-list"),
    byVaga: (vagaId: string) => ["admin-candidatos-by-vaga", vagaId] as const,
    byVagaFiltered: (vagaId: string, filters: unknown) =>
      ["admin-candidatos-by-vaga", vagaId, filters] as const,
  },
  empresas: {
    list: createListKey<unknown>("admin-empresas-list"),
    detail: createDetailKey("admin-company-consolidated"),
  },
  vagas: {
    list: createListKey<unknown>("admin-vagas-list"),
    detail: createDetailKey("admin-vaga-detail"),
  },
  statusCandidatura: {
    list: () => ["status-candidatura-list"] as const,
  },
  candidaturas: {
    detalhe: createDetailKey("candidatura-detalhe"),
  },
  aulas: {
    list: createListKey<unknown>("admin-aulas-list"),
    detail: createDetailKey("admin-aula-detail"),
  },
};
