const PAGAMENTOS_BASE = "/api/v1/empresas/pagamentos";

export const pagamentosRoutes = {
  list: () => PAGAMENTOS_BASE,
  planos: () => `${PAGAMENTOS_BASE}/planos`,
} as const;

