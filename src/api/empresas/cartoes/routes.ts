const CARTOES_BASE = "/api/v1/empresas/cartoes";
const PREFERENCIA_BASE = "/api/v1/empresas/preferencia-pagamento";

export const cartoesRoutes = {
  /** GET - Listar cartões */
  list: () => CARTOES_BASE,

  /** POST - Adicionar cartão */
  add: () => CARTOES_BASE,

  /** PUT - Definir cartão como padrão */
  setPadrao: (id: string) => `${CARTOES_BASE}/${id}/padrao`,

  /** DELETE - Remover cartão */
  remove: (id: string) => `${CARTOES_BASE}/${id}`,

  /** POST - Pagar fatura pendente com cartão */
  pagarPendente: (id: string) => `${CARTOES_BASE}/${id}/pagar-pendente`,

  /** Preferência de pagamento */
  preferencia: {
    /** GET - Obter preferência atual */
    get: () => PREFERENCIA_BASE,

    /** PUT - Atualizar preferência */
    update: () => PREFERENCIA_BASE,
  },
} as const;

