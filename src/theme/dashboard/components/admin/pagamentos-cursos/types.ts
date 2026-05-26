import type {
  StatusPagamento,
  TipoPagamento,
} from "@/api/empresas/pagamentos/types";
import type {
  ListMeusPagamentosParams,
  MeuPagamentoItem,
  MeuPagamentoStatus,
  ListMeusPagamentosResponse,
} from "@/api/cursos/types";

export interface PagamentoCurso
  extends Omit<MeuPagamentoItem, "status"> {
  status: StatusPagamento | null;
}

export type PagamentoCursoDetalhes = MeuPagamentoItem["detalhes"];
export type PagamentosCursosResumo =
  ListMeusPagamentosResponse["data"]["summary"];
export type PagamentosCursosPagination =
  ListMeusPagamentosResponse["data"]["pagination"];

export interface PagamentosCursosDashboardProps {
  className?: string;
}

export interface PagamentosCursosParams
  extends Omit<ListMeusPagamentosParams, "status"> {
  status?: MeuPagamentoStatus;
}

export interface PagamentosCursosData {
  pagamentos: PagamentoCurso[];
  resumo: PagamentosCursosResumo;
  pagination: PagamentosCursosPagination;
  pendingCount: number;
  filters: ListMeusPagamentosResponse["data"]["filters"];
}

export interface PagamentoCursoTableProps {
  pagamentos: PagamentoCurso[];
  isLoading: boolean;
  showActions?: boolean;
  onViewPix?: (pagamento: PagamentoCurso) => void;
  onViewBoleto?: (pagamento: PagamentoCurso) => void;
  onPayRecuperacao?: (pagamento: PagamentoCurso) => void;
}

export interface PagamentoCursoRowProps {
  pagamento: PagamentoCurso;
  showActions?: boolean;
  onViewPix?: (pagamento: PagamentoCurso) => void;
  onViewBoleto?: (pagamento: PagamentoCurso) => void;
  onPayRecuperacao?: (pagamento: PagamentoCurso) => void;
}
