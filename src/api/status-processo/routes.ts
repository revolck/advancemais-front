// Rotas da API para Status de Processo
export const STATUS_PROCESSO_ROUTES = {
  // Listar status de processo
  LIST: "/api/v1/status-processo",

  // Obter status por ID
  GET_BY_ID: (id: string) => `/api/v1/status-processo/${id}`,

  // Criar novo status
  CREATE: "/api/v1/status-processo",

  // Atualizar status
  UPDATE: (id: string) => `/api/v1/status-processo/${id}`,

  // Reordenar status
  REORDER: (id: string) => `/api/v1/status-processo/${id}/reorder`,

  // Excluir status
  DELETE: (id: string) => `/api/v1/status-processo/${id}`,

  // Verificar uso do status
  CHECK_USAGE: (id: string) => `/api/v1/status-processo/${id}/usage`,
} as const;







