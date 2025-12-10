import type {
  Pagamento,
  PagamentosResumo,
  PagamentosPagination,
  PagamentosParams,
  TipoPagamento,
  StatusPagamento,
} from "@/api/empresas/pagamentos/types";

export type { Pagamento, PagamentosResumo, PagamentosPagination, TipoPagamento, StatusPagamento };

export interface PagamentosDashboardProps {
  className?: string;
  filters?: PagamentosParams;
}

export interface PagamentoTableProps {
  pagamentos: Pagamento[];
  isLoading: boolean;
  onViewPix?: (pagamento: Pagamento) => void;
  onViewBoleto?: (pagamento: Pagamento) => void;
}

export interface PagamentoRowProps {
  pagamento: Pagamento;
  onViewPix?: (pagamento: Pagamento) => void;
  onViewBoleto?: (pagamento: Pagamento) => void;
}


