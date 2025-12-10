/**
 * Tipos para o módulo de Pagamentos da Empresa
 */

export type TipoPagamento =
  | "CHECKOUT_START"
  | "PAYMENT_CREATED"
  | "PAYMENT_APPROVED"
  | "PAYMENT_REJECTED"
  | "PAYMENT_CANCELLED"
  | "PAYMENT_STATUS_UPDATE"
  | "CHECKOUT_ERROR";

export type StatusPagamento =
  | "PENDENTE"
  | "EM_PROCESSAMENTO"
  | "APROVADO"
  | "RECUSADO"
  | "CANCELADO"
  | "ERRO";

export interface PagamentoPlano {
  id: string;
  nome: string;
}

export interface PagamentoPixDetalhes {
  qrCode: string | null;
  copiaCola: string | null;
  expiraEm: string | null;
}

export interface PagamentoBoletoDetalhes {
  codigo: string | null;
  urlPdf: string | null;
  vencimento: string | null;
}

export interface PagamentoDetalhes {
  pix?: PagamentoPixDetalhes;
  boleto?: PagamentoBoletoDetalhes;
}

export interface Pagamento {
  id: string;
  tipo: TipoPagamento;
  tipoDescricao: string;
  status: StatusPagamento | null;
  statusDescricao: string;
  valor: number | null;
  valorFormatado: string | null;
  metodo: string | null;
  metodoDescricao: string | null;
  plano: PagamentoPlano | null;
  referencia: string | null;
  transacaoId: string | null;
  criadoEm: string;
  detalhes: PagamentoDetalhes | null;
}

export interface PagamentosResumo {
  totalPago: number;
  totalPendente: number;
  totalTransacoes: number;
  ultimoPagamento: string | null;
}

export interface PagamentosPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PagamentosData {
  pagamentos: Pagamento[];
  resumo: PagamentosResumo;
  pagination: PagamentosPagination;
}

export interface PagamentosResponse {
  success: boolean;
  data: PagamentosData;
}

export interface PagamentosParams {
  page?: number;
  pageSize?: number;
  status?: StatusPagamento;
  metodo?: string;
  planoId?: string;
  valorMin?: number;
  valorMax?: number;
  dataInicio?: string;
  dataFim?: string;
  empresaId?: string;
}

export interface PlanoEmpresa {
  id: string;
  nome: string;
  valor: string;
  status: string;
  statusPagamento: string;
  inicio: string | null;
  fim: string | null;
  proximaCobranca: string | null;
}

export interface PlanosEmpresaResponse {
  success: boolean;
  data: PlanoEmpresa[];
}

