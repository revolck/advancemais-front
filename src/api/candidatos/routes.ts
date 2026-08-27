export const CANDIDATOS_ROUTES = {
  // Module info
  BASE: "/api/v1/candidatos",
  DASHBOARD: "/api/v1/candidatos/dashboard",
  // Candidatos - Candidaturas
  APLICAR: "/api/v1/candidatos/aplicar",
  MINHAS_CANDIDATURAS: "/api/v1/candidatos/candidaturas",
  OVERVIEW: "/api/v1/candidatos/candidaturas/overview",
  RECEBIDAS: "/api/v1/candidatos/candidaturas/recebidas",
  CANDIDATURA: (id: string) => `/api/v1/candidatos/candidaturas/${id}`,
  STATUS_DISPONIVEIS: "/api/v1/candidatos/candidaturas/status-disponiveis",
  VERIFICAR_CANDIDATURA: "/api/v1/candidatos/candidaturas/verificar",

  // Candidatos - Currículos
  CURRICULOS: "/api/v1/candidatos/curriculos",
  CURRICULO: (id: string) => `/api/v1/candidatos/curriculos/${id}`,
  CURRICULO_PRINCIPAL: (id: string) =>
    `/api/v1/candidatos/curriculos/${id}/principal`,
  // NOTA: CURRICULO_PDF removido - endpoint não existe no backend
  // Use generateCurriculoPdf para gerar PDFs no frontend

  // Candidatos - Áreas de interesse
  AREAS_INTERESSE: "/api/v1/candidatos/areas-interesse",
  AREA_INTERESSE: (id: number | string) =>
    `/api/v1/candidatos/areas-interesse/${id}`,
  SUBAREAS_INTERESSE_LIST: "/api/v1/candidatos/subareas-interesse",
  SUBAREAS_INTERESSE: (areaId: number | string) =>
    `/api/v1/candidatos/areas-interesse/${areaId}/subareas`,
  SUBAREA_INTERESSE: (subareaId: number | string) =>
    `/api/v1/candidatos/subareas-interesse/${subareaId}`,

  // Candidatos - Vagas públicas
  VAGAS_PUBLICAS: "/api/v1/candidatos/vagas",

  // Candidatos - Cursos (ALUNO_CANDIDATO)
  CURSOS: "/api/v1/candidatos/cursos",
  CURSO_ESTRUTURA: (cursoId: string, turmaId: string) =>
    `/api/v1/candidatos/cursos/${cursoId}/turmas/${turmaId}/estrutura`,
  CURSO_AULA: (cursoId: string, turmaId: string, aulaId: string) =>
    `/api/v1/candidatos/cursos/${cursoId}/turmas/${turmaId}/aulas/${aulaId}`,
  CURSO_ATIVIDADE: (cursoId: string, turmaId: string, atividadeId: string) =>
    `/api/v1/candidatos/cursos/${cursoId}/turmas/${turmaId}/atividades/${atividadeId}`,
  CURSO_ATIVIDADE_RESPOSTA: (
    cursoId: string,
    turmaId: string,
    atividadeId: string,
  ) =>
    `/api/v1/candidatos/cursos/${cursoId}/turmas/${turmaId}/atividades/${atividadeId}/resposta`,
} as const;
