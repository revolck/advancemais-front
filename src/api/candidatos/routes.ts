export const CANDIDATOS_ROUTES = {
  // Module info
  BASE: "/api/v1/candidatos",
  // Candidatos - Candidaturas
  APLICAR: "/api/v1/candidatos/aplicar",
  MINHAS_CANDIDATURAS: "/api/v1/candidatos/candidaturas",
  OVERVIEW: "/api/v1/candidatos/candidaturas/overview",
  RECEBIDAS: "/api/v1/candidatos/candidaturas/recebidas",
  CANDIDATURA: (id: string) => `/api/v1/candidatos/candidaturas/${id}`,
  STATUS_DISPONIVEIS: "/api/v1/candidatos/candidaturas/status-disponiveis",

  // Candidatos - Currículos
  CURRICULOS: "/api/v1/candidatos/curriculos",
  CURRICULO: (id: string) => `/api/v1/candidatos/curriculos/${id}`,
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
} as const;
