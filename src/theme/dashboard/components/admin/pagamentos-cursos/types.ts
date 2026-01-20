import type {
  StatusPagamento,
  TipoPagamento,
} from "@/api/empresas/pagamentos/types";
import type {
  PagamentoCurso,
  PagamentosCursosResumo,
  PagamentosCursosPagination,
  PagamentoCursoDetalhes,
} from "@/mockData/pagamentos-cursos";

export type {
  PagamentoCurso,
  PagamentosCursosResumo,
  PagamentosCursosPagination,
  PagamentoCursoDetalhes,
};

export interface PagamentosCursosDashboardProps {
  className?: string;
}

export interface PagamentosCursosParams {
  page?: number;
  pageSize?: number;
  status?: StatusPagamento;
  metodo?: string;
  cursoId?: string;
  turmaId?: string;
  valorMin?: number;
  valorMax?: number;
  dataInicio?: string;
  dataFim?: string;
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

