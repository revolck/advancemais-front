import type { TipoPagamento, StatusPagamento } from "../types";

// Labels unificados para status (usado em filtros E badges)
const STATUS_LABELS: Record<StatusPagamento, string> = {
  PENDENTE: "Pendente",
  EM_PROCESSAMENTO: "Processando",
  APROVADO: "Aprovado",
  RECUSADO: "Recusado",
  CANCELADO: "Cancelado",
  ERRO: "Erro",
};

// Labels unificados para tipos (usado em filtros E tabela)
const TIPO_LABELS: Record<TipoPagamento, string> = {
  CHECKOUT_START: "Checkout",
  PAYMENT_CREATED: "Pagamento criado",
  PAYMENT_APPROVED: "Aprovado",
  PAYMENT_REJECTED: "Rejeitado",
  PAYMENT_CANCELLED: "Cancelado",
  PAYMENT_STATUS_UPDATE: "Atualização",
  CHECKOUT_ERROR: "Erro",
};

export const TIPO_OPTIONS: { value: TipoPagamento; label: string }[] = [
  { value: "CHECKOUT_START", label: TIPO_LABELS.CHECKOUT_START },
  { value: "PAYMENT_CREATED", label: TIPO_LABELS.PAYMENT_CREATED },
  { value: "PAYMENT_APPROVED", label: TIPO_LABELS.PAYMENT_APPROVED },
  { value: "PAYMENT_REJECTED", label: TIPO_LABELS.PAYMENT_REJECTED },
  { value: "PAYMENT_CANCELLED", label: TIPO_LABELS.PAYMENT_CANCELLED },
  { value: "PAYMENT_STATUS_UPDATE", label: TIPO_LABELS.PAYMENT_STATUS_UPDATE },
  { value: "CHECKOUT_ERROR", label: TIPO_LABELS.CHECKOUT_ERROR },
];

export const STATUS_OPTIONS: { value: StatusPagamento; label: string }[] = [
  { value: "PENDENTE", label: STATUS_LABELS.PENDENTE },
  { value: "EM_PROCESSAMENTO", label: STATUS_LABELS.EM_PROCESSAMENTO },
  { value: "APROVADO", label: STATUS_LABELS.APROVADO },
  { value: "RECUSADO", label: STATUS_LABELS.RECUSADO },
  { value: "CANCELADO", label: STATUS_LABELS.CANCELADO },
  { value: "ERRO", label: STATUS_LABELS.ERRO },
];

export const STATUS_CONFIG: Record<
  StatusPagamento,
  { label: string; color: string; bgColor: string }
> = {
  PENDENTE: {
    label: STATUS_LABELS.PENDENTE,
    color: "text-amber-700",
    bgColor: "bg-amber-100",
  },
  EM_PROCESSAMENTO: {
    label: STATUS_LABELS.EM_PROCESSAMENTO,
    color: "text-blue-700",
    bgColor: "bg-blue-100",
  },
  APROVADO: {
    label: STATUS_LABELS.APROVADO,
    color: "text-emerald-700",
    bgColor: "bg-emerald-100",
  },
  RECUSADO: {
    label: STATUS_LABELS.RECUSADO,
    color: "text-red-700",
    bgColor: "bg-red-100",
  },
  CANCELADO: {
    label: STATUS_LABELS.CANCELADO,
    color: "text-gray-700",
    bgColor: "bg-gray-100",
  },
  ERRO: {
    label: STATUS_LABELS.ERRO,
    color: "text-red-700",
    bgColor: "bg-red-100",
  },
};

export const METODO_OPTIONS: { value: string; label: string }[] = [
  { value: "pix", label: "PIX" },
  { value: "boleto", label: "Boleto" },
  { value: "credit_card", label: "Cartão de Crédito" },
  { value: "debit_card", label: "Cartão de Débito" },
];

export { TIPO_LABELS, STATUS_LABELS };

export const METODO_ICONS: Record<string, string> = {
  pix: "⚡",
  boleto: "📄",
  bolbradesco: "📄",
  credit_card: "💳",
  debit_card: "💳",
  default: "💰",
};

