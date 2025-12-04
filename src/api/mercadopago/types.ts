// ==============================================
// Tipos do Módulo MercadoPago (Pagamentos)
// Baseados na documentação interna
// SDK: mercadopago@2.11.0
// ==============================================

export type MetodoOperacao = "pagamento" | "assinatura";
export type MetodoPagamento = "pix" | "card" | "boleto";

// ========================================
// Pagamentos Únicos (Checkout Pro)
// ========================================

export type PaymentStatus =
  | "pending"
  | "approved"
  | "authorized"
  | "in_process"
  | "in_mediation"
  | "rejected"
  | "cancelled"
  | "refunded"
  | "charged_back";

export interface PaymentItem {
  id?: string;
  title: string;
  description?: string;
  picture_url?: string;
  category_id?: string;
  quantity: number;
  unit_price: number;
  currency_id?: string;
}

export interface PaymentPayer {
  name?: string;
  surname?: string;
  email: string;
  phone?: {
    area_code?: string;
    number?: string;
  };
  identification?: {
    type: "CPF" | "CNPJ";
    number: string;
  };
  address?: {
    street_name?: string;
    street_number?: number;
    zip_code?: string;
  };
}

export interface SinglePaymentIntent {
  /** ID do usuário na plataforma */
  usuarioId: string;
  /** Items do pagamento */
  items: PaymentItem[];
  /** Dados do pagador */
  payer?: PaymentPayer;
  /** URL de redirecionamento em caso de sucesso */
  successUrl?: string;
  /** URL de redirecionamento em caso de falha */
  failureUrl?: string;
  /** URL de redirecionamento para pagamento pendente */
  pendingUrl?: string;
  /** Referência externa (ex: ID do pedido) */
  externalReference?: string;
  /** URL para receber notificações (webhook) */
  notificationUrl?: string;
  /** Métodos de pagamento excluídos */
  excludedPaymentMethods?: string[];
  /** Tipos de pagamento excluídos */
  excludedPaymentTypes?: string[];
  /** Número máximo de parcelas */
  installments?: number;
  /** Data de expiração da preferência */
  expiresAt?: string;
  /** Metadados customizados */
  metadata?: Record<string, unknown>;
}

export interface SinglePaymentResponse {
  success: boolean;
  /** ID da preferência criada */
  preferenceId: string;
  /** URL do Checkout Pro */
  initPoint: string;
  /** URL do Checkout Pro em modo sandbox */
  sandboxInitPoint?: string;
  /** Referência externa */
  externalReference?: string;
  /** Data de expiração */
  expiresAt?: string;
}

export interface PaymentDetails {
  id: string;
  status: PaymentStatus;
  statusDetail: string;
  externalReference?: string;
  transactionAmount: number;
  currencyId: string;
  paymentMethodId: string;
  paymentTypeId: string;
  installments?: number;
  dateCreated: string;
  dateApproved?: string;
  payer?: {
    email: string;
    identification?: {
      type: string;
      number: string;
    };
  };
  metadata?: Record<string, unknown>;
}

export interface PaymentListParams {
  usuarioId?: string;
  status?: PaymentStatus;
  externalReference?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export interface PaymentListResponse {
  items: PaymentDetails[];
  total: number;
  page: number;
  pageSize: number;
}

export interface RefundPayload {
  /** Valor a ser reembolsado (parcial ou total) */
  amount?: number;
  /** Motivo do reembolso */
  reason?: string;
}

export interface RefundResponse {
  success: boolean;
  refundId: string;
  paymentId: string;
  amount: number;
  status: string;
  dateCreated: string;
}

// ========================================
// Assinaturas (tipos existentes)
// ========================================

/**
 * Endereço do pagador para Boleto
 * Obrigatório quando pagamento='boleto'
 */
export interface CheckoutPayerAddress {
  /** CEP (8 ou 9 dígitos) */
  zip_code: string;
  /** Logradouro (ex: "Av Paulista") */
  street_name: string;
  /** Número (ex: "1000") */
  street_number: string;
  /** Bairro (ex: "Bela Vista") */
  neighborhood: string;
  /** Cidade (ex: "São Paulo") */
  city: string;
  /** Estado/UF (2 caracteres, ex: "SP") */
  federal_unit: string;
}

/**
 * Dados do pagador para PIX/Boleto
 * Obrigatório quando metodo='pagamento' (PIX ou Boleto)
 */
export interface CheckoutPayer {
  email: string;
  identification: {
    /** Tipo de documento: "CPF" ou "CNPJ" */
    type: "CPF" | "CNPJ";
    /** Número do documento (apenas dígitos, sem formatação) */
    number: string;
  };
  /** Nome do pagador (opcional) */
  first_name?: string;
  /** Sobrenome do pagador (opcional) */
  last_name?: string;
  /** Endereço do pagador (OBRIGATÓRIO para Boleto) */
  address?: CheckoutPayerAddress;
}

export interface CheckoutIntent {
  // ✅ OBRIGATÓRIOS
  usuarioId: string;
  planosEmpresariaisId: string;
  metodo: MetodoOperacao;
  aceitouTermos: true; // ⚠️ DEVE SER true - OBRIGATÓRIO!

  // 🔐 ACEITE DE TERMOS (opcionais para auditoria)
  aceitouTermosIp?: string;
  aceitouTermosUserAgent?: string;

  // ⚠️ CONDICIONAIS
  pagamento?: MetodoPagamento;
  card?: {
    token: string;
    installments?: number;
  };

  // 💳 DADOS DO PAGADOR (obrigatório para PIX/Boleto)
  payer?: CheckoutPayer;

  // 🎫 CUPOM DE DESCONTO (opcional)
  cupomCodigo?: string;

  // 🔗 URLs DE RETORNO (opcionais)
  successUrl?: string;
  failureUrl?: string;
  pendingUrl?: string;
}

export interface CheckoutResponse {
  success: boolean;
  checkoutId?: string;
  metodo?: MetodoOperacao;

  // Dados do plano criado
  plano?: {
    id: string;
    usuarioId: string;
    planosEmpresariaisId: string;
    status: string;
    statusPagamento: string;
    modeloPagamento: string;
    metodoPagamento: string;
    inicio: string | null;
    fim: string | null;
    proximaCobranca: string | null;
    graceUntil: string | null;
  };

  // Dados do pagamento (PIX, Boleto, Card)
  pagamento?: {
    tipo: MetodoPagamento;
    status: string;
    paymentId?: string;
    // PIX
    qrCode?: string;
    qrCodeBase64?: string;
    // Boleto
    barcode?: string;
    boletoUrl?: string;
    // Card
    installments?: number;
    // Comum
    expiresAt?: string;
  };

  // Dados da assinatura (preapproval)
  assinatura?: {
    preapprovalId?: string;
    status: string;
    initPoint?: string;
    requiresRedirect?: boolean;
  };

  // Confirmação do aceite de termos
  termos?: {
    aceitouTermos: boolean;
    aceitouTermosEm: string;
  };

  // Desconto aplicado (se cupom usado)
  desconto?: {
    cupomCodigo: string;
    cupomId: string;
    valorOriginal: number;
    valorDesconto: number;
    valorFinal: number;
  } | null;

  // Campos legados (compatibilidade)
  /** @deprecated Use pagamento.qrCode */
  qrCode?: string;
  /** @deprecated Use pagamento.qrCodeBase64 */
  qrCodeBase64?: string;
  /** @deprecated Use assinatura.initPoint */
  link?: string;
  status?: string;
  valor?: number;
  installments?: number;
  cardLastFour?: string;
  cardBrand?: string;
  proximaCobranca?: string;
  expiresAt?: string;
  preferenceId?: string;
  paymentId?: string;
  preapprovalId?: string;

  // Erro
  code?: string;
  message?: string;
  issues?: Record<string, string[]>;
  error?: string;
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

