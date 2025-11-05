// ==============================================
// Tipos do Módulo MercadoPago (Pagamentos)
// Baseados na documentação interna
// ==============================================

export type MetodoOperacao = "pagamento" | "assinatura";
export type MetodoPagamento = "pix" | "card" | "boleto";

export interface CheckoutIntent {
  usuarioId: string;
  planosEmpresariaisId: string;
  metodo: MetodoOperacao;
  pagamento?: MetodoPagamento;
  card?: {
    token: string;
    installments?: number;
  };
  successUrl?: string;
  failureUrl?: string;
  pendingUrl?: string;
}

export interface CheckoutResponse {
  success: boolean;
  metodo: MetodoOperacao;
  pagamento?: MetodoPagamento;
  preferenceId?: string;
  paymentId?: string;
  preapprovalId?: string;
  qrCode?: string;
  qrCodeBase64?: string;
  link?: string;
  status: string;
  valor: number;
  installments?: number;
  cardLastFour?: string;
  cardBrand?: string;
  proximaCobranca?: string;
  expiresAt?: string;
}

export interface CancelSubscriptionPayload {
  usuarioId: string;
  motivo?: string;
}

export interface PlanChangePayload {
  usuarioId: string;
  novoPlanosEmpresariaisId: string;
}

export interface RemindPaymentPayload {
  usuarioId: string;
}

export interface AdminRemindPaymentPayload {
  usuarioId: string;
  planosEmpresariaisId: string;
  metodoPagamento: "PIX" | "BOLETO" | "CARTAO";
  successUrl?: string;
  failureUrl?: string;
  pendingUrl?: string;
}

export interface SyncPlanPayload {
  planosEmpresariaisId: string;
}

export interface Assinatura {
  id: string;
  usuarioId: string;
  planosEmpresariaisId: string;
  status: "ATIVO" | "CANCELADO" | "PENDENTE" | "SUSPENSO";
  modo: "RECORRENTE" | "UNICO";
  inicio: string;
  fim?: string;
  modeloPagamento?: "RECORRENTE" | "UNICO";
  metodoPagamento?: "PIX" | "CARTAO" | "BOLETO";
  statusPagamento?: "PENDENTE" | "APROVADO" | "REJEITADO" | "CANCELADO";
  mpPreapprovalId?: string;
  mpSubscriptionId?: string;
  mpPayerId?: string;
  mpPaymentId?: string;
  proximaCobranca?: string;
  graceUntil?: string;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface CancelSubscriptionResponse {
  success: boolean;
  assinatura: Assinatura & { canceladoEm?: string; motivo?: string };
}

export interface PlanChangeResponse {
  success: boolean;
  assinatura: Assinatura & {
    valorAnterior?: number;
    valorNovo?: number;
    vagasAfetadas?: number;
  };
}

export interface RemindPaymentResponse {
  success: boolean;
  preferenceId: string;
  link: string;
  emailEnviado?: boolean;
  valor?: number;
  expiresAt?: string;
}

export interface ReconcileResponse {
  success: boolean;
  processados: number;
  cancelados: number;
  normalizados: number;
  erros: number;
  detalhes?: {
    assinaturasCanceladas?: string[];
    assinaturasNormalizadas?: string[];
  };
}

export interface AdminRemindResponse {
  success: boolean;
  preferenceId: string;
  link: string;
  metodoPagamento: string;
  valor?: number;
  expiresAt?: string;
}

export interface SyncPlanResponse {
  success: boolean;
  planosEmpresariaisId: string;
  mpPreapprovalPlanId: string;
}

export interface SyncPlansResponse {
  success: boolean;
  count: number;
  results: Record<string, string>;
}

export interface LogPagamento {
  id: string;
  usuarioId?: string;
  empresasPlanoId?: string;
  tipo: string;
  dados: Record<string, any>;
  criadoEm: string;
  atualizadoEm?: string;
}

export interface LogsListParams {
  usuarioId?: string;
  empresasPlanoId?: string;
  tipo?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number; // default 20 max 100
}

export interface LogsListResponse {
  items: LogPagamento[];
  total: number;
  page: number;
  pageSize: number;
}

export interface WebhookEvent {
  type: "payment" | "subscription" | "preapproval";
  action: string;
  data: { id: string };
}

export type MercadoPagoErrorCode =
  | "VALIDATION_ERROR"
  | "CHECKOUT_ERROR"
  | "CANCEL_ERROR"
  | "UPGRADE_ERROR"
  | "DOWNGRADE_ERROR"
  | "REMIND_ERROR"
  | "RECONCILE_ERROR"
  | "WEBHOOK_ERROR"
  | "ADMIN_REMIND_ERROR"
  | "SYNC_PLANS_ERROR"
  | "SYNC_PLAN_ERROR"
  | "LOGS_LIST_ERROR"
  | "LOGS_GET_ERROR"
  | "INVALID_SIGNATURE"
  | "LOG_NOT_FOUND"
  | "FORBIDDEN";

