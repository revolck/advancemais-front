export const PERMISSOES_ROUTES = {
  RECURSOS: "/api/v1/permissoes/recursos",
  GRANTS: "/api/v1/permissoes/grants",
  GRANT: (id: string) => `/api/v1/permissoes/grants/${id}`,
  MINHAS: "/api/v1/permissoes/minhas",
  AUDITORIA: "/api/v1/permissoes/auditoria",
} as const;

