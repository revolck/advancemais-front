/**
 * Mock de dados para Pagamentos de Cursos
 * Usado no dashboard de pagamentos de cursos
 */

import type {
  StatusPagamento,
  TipoPagamento,
} from "@/api/empresas/pagamentos/types";

export interface PagamentoCursoDetalhes {
  pix?: {
    qrCode: string | null;
    copiaCola: string | null;
    expiraEm: string | null;
  };
  boleto?: {
    codigo: string | null;
    urlPdf: string | null;
    vencimento: string | null;
  };
}

export interface PagamentoCurso {
  id: string;
  tipo: TipoPagamento;
  tipoDescricao: string;
  status: StatusPagamento | null;
  statusDescricao: string;
  valor: number | null;
  valorFormatado: string | null;
  metodo: string | null;
  metodoDescricao: string | null;
  curso: {
    id: string;
    nome: string;
  } | null;
  turma: {
    id: string;
    nome: string;
  } | null;
  prova: {
    id: string;
    titulo: string;
  } | null;
  tipoPagamento: "recuperacao-final" | "outro" | null;
  referencia: string | null;
  transacaoId: string | null;
  criadoEm: string;
  validadeAte?: string | null; // Data e horário limite para pagamento
  detalhes: PagamentoCursoDetalhes | null;
}

export interface PagamentosCursosResumo {
  totalPago: number;
  totalPendente: number;
  totalTransacoes: number;
  ultimoPagamento: string | null;
}

export interface PagamentosCursosPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PagamentosCursosData {
  pagamentos: PagamentoCurso[];
  resumo: PagamentosCursosResumo;
  pagination: PagamentosCursosPagination;
}

// Mock de pagamentos de cursos
const mockPagamentos: PagamentoCurso[] = [
  {
    id: "test-pendente-1",
    tipo: "PAYMENT_CREATED",
    tipoDescricao: "Pagamento criado",
    status: "PENDENTE",
    statusDescricao: "Pendente",
    valor: 50.0,
    valorFormatado: "R$ 50,00",
    metodo: null,
    metodoDescricao: null,
    curso: {
      id: "curso-test",
      nome: "Desenvolvimento Web Full Stack",
    },
    turma: {
      id: "turma-test",
      nome: "Turma 2024.1",
    },
    prova: {
      id: "prova-test",
      titulo: "Recuperação Final - Módulo Teste",
    },
    tipoPagamento: "recuperacao-final",
    referencia: "tipo:recuperacao-final:curso:curso-test:turma:turma-test:prova:prova-test:aluno:user-123",
    transacaoId: null,
    criadoEm: new Date().toISOString(),
    validadeAte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias a partir de agora
    detalhes: null,
  },
  {
    id: "1",
    tipo: "PAYMENT_APPROVED",
    tipoDescricao: "Aprovado",
    status: "APROVADO",
    statusDescricao: "Aprovado",
    valor: 50.0,
    valorFormatado: "R$ 50,00",
    metodo: "pix",
    metodoDescricao: "PIX",
    curso: {
      id: "curso-1",
      nome: "Desenvolvimento Web Full Stack",
    },
    turma: {
      id: "turma-1",
      nome: "Turma 2024.1",
    },
    prova: {
      id: "prova-1",
      titulo: "Recuperação Final - Módulo 1",
    },
    tipoPagamento: "recuperacao-final",
    referencia: "tipo:recuperacao-final:curso:curso-1:turma:turma-1:prova:prova-1:aluno:user-123",
    transacaoId: "MP-123456789",
    criadoEm: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    detalhes: null,
  },
  {
    id: "2",
    tipo: "PAYMENT_APPROVED",
    tipoDescricao: "Aprovado",
    status: "APROVADO",
    statusDescricao: "Aprovado",
    valor: 75.0,
    valorFormatado: "R$ 75,00",
    metodo: "credit_card",
    metodoDescricao: "Cartão de Crédito",
    curso: {
      id: "curso-2",
      nome: "React Avançado",
    },
    turma: {
      id: "turma-2",
      nome: "Turma 2024.2",
    },
    prova: {
      id: "prova-2",
      titulo: "Recuperação Final - Módulo 2",
    },
    tipoPagamento: "recuperacao-final",
    referencia: "tipo:recuperacao-final:curso:curso-2:turma:turma-2:prova:prova-2:aluno:user-123",
    transacaoId: "MP-987654321",
    criadoEm: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    detalhes: null,
  },
  {
    id: "3",
    tipo: "PAYMENT_CREATED",
    tipoDescricao: "Pagamento criado",
    status: "PENDENTE",
    statusDescricao: "Pendente",
    valor: 100.0,
    valorFormatado: "R$ 100,00",
    metodo: "boleto",
    metodoDescricao: "Boleto",
    curso: {
      id: "curso-3",
      nome: "Node.js e Express",
    },
    turma: {
      id: "turma-3",
      nome: "Turma 2024.1",
    },
    prova: {
      id: "prova-3",
      titulo: "Recuperação Final - Módulo 3",
    },
    tipoPagamento: "recuperacao-final",
    referencia: "tipo:recuperacao-final:curso:curso-3:turma:turma-3:prova:prova-3:aluno:user-123",
    transacaoId: "MP-456789123",
    criadoEm: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    detalhes: {
      boleto: {
        codigo: "34191.09008 01234.567890 12345.678901 2 98760000010000",
        urlPdf: "https://www.mercadopago.com.br/payments/123456/ticket?caller_id=123456789&hash=abc123",
        vencimento: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    },
  },
  {
    id: "4",
    tipo: "PAYMENT_CREATED",
    tipoDescricao: "Pagamento criado",
    status: "PENDENTE",
    statusDescricao: "Pendente",
    valor: 50.0,
    valorFormatado: "R$ 50,00",
    metodo: "pix",
    metodoDescricao: "PIX",
    curso: {
      id: "curso-1",
      nome: "Desenvolvimento Web Full Stack",
    },
    turma: {
      id: "turma-1",
      nome: "Turma 2024.1",
    },
    prova: {
      id: "prova-4",
      titulo: "Recuperação Final - Módulo 4",
    },
    tipoPagamento: "recuperacao-final",
    referencia: "tipo:recuperacao-final:curso:curso-1:turma:turma-1:prova:prova-4:aluno:user-123",
    transacaoId: "MP-789123456",
    criadoEm: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    detalhes: {
      pix: {
        qrCode: "00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-426655440000520400005303986540550.005802BR5925MERCADO PAGO LTDA6009SAO PAULO62070503***6304ABCD",
        copiaCola: "00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-426655440000520400005303986540550.005802BR5925MERCADO PAGO LTDA6009SAO PAULO62070503***6304ABCD",
        expiraEm: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      },
    },
  },
  {
    id: "5",
    tipo: "PAYMENT_REJECTED",
    tipoDescricao: "Rejeitado",
    status: "RECUSADO",
    statusDescricao: "Recusado",
    valor: 60.0,
    valorFormatado: "R$ 60,00",
    metodo: "credit_card",
    metodoDescricao: "Cartão de Crédito",
    curso: {
      id: "curso-4",
      nome: "TypeScript Avançado",
    },
    turma: {
      id: "turma-4",
      nome: "Turma 2024.1",
    },
    prova: {
      id: "prova-5",
      titulo: "Recuperação Final - Módulo 5",
    },
    tipoPagamento: "recuperacao-final",
    referencia: "tipo:recuperacao-final:curso:curso-4:turma:turma-4:prova:prova-5:aluno:user-123",
    transacaoId: "MP-321654987",
    criadoEm: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    detalhes: null,
  },
  {
    id: "6",
    tipo: "PAYMENT_APPROVED",
    tipoDescricao: "Aprovado",
    status: "APROVADO",
    statusDescricao: "Aprovado",
    valor: 80.0,
    valorFormatado: "R$ 80,00",
    metodo: "pix",
    metodoDescricao: "PIX",
    curso: {
      id: "curso-5",
      nome: "Banco de Dados",
    },
    turma: {
      id: "turma-5",
      nome: "Turma 2024.2",
    },
    prova: {
      id: "prova-6",
      titulo: "Recuperação Final - Módulo 6",
    },
    tipoPagamento: "recuperacao-final",
    referencia: "tipo:recuperacao-final:curso:curso-5:turma:turma-5:prova:prova-6:aluno:user-123",
    transacaoId: "MP-147258369",
    criadoEm: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    detalhes: null,
  },
  {
    id: "7",
    tipo: "PAYMENT_CREATED",
    tipoDescricao: "Pagamento criado",
    status: "EM_PROCESSAMENTO",
    statusDescricao: "Processando",
    valor: 90.0,
    valorFormatado: "R$ 90,00",
    metodo: "credit_card",
    metodoDescricao: "Cartão de Crédito",
    curso: {
      id: "curso-6",
      nome: "DevOps e CI/CD",
    },
    turma: {
      id: "turma-6",
      nome: "Turma 2024.1",
    },
    prova: {
      id: "prova-7",
      titulo: "Recuperação Final - Módulo 7",
    },
    tipoPagamento: "recuperacao-final",
    referencia: "tipo:recuperacao-final:curso:curso-6:turma:turma-6:prova:prova-7:aluno:user-123",
    transacaoId: "MP-369258147",
    criadoEm: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    detalhes: null,
  },
];

// Função para calcular resumo
function calculateResumo(pagamentos: PagamentoCurso[]): PagamentosCursosResumo {
  const aprovados = pagamentos.filter((p) => p.status === "APROVADO");
  const pendentes = pagamentos.filter(
    (p) => p.status === "PENDENTE" || p.status === "EM_PROCESSAMENTO"
  );

  const totalPago = aprovados.reduce((sum, p) => sum + (p.valor || 0), 0);
  const totalPendente = pendentes.reduce((sum, p) => sum + (p.valor || 0), 0);

  const ultimoPagamento = aprovados.length > 0
    ? aprovados.sort(
        (a, b) =>
          new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
      )[0].criadoEm
    : null;

  return {
    totalPago,
    totalPendente,
    totalTransacoes: pagamentos.length,
    ultimoPagamento,
  };
}

// Função para filtrar pagamentos
export function getMockPagamentosCursos(params?: {
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
}): PagamentosCursosData {
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 10;

  let filtered = [...mockPagamentos];

  // Filtro por status
  if (params?.status) {
    filtered = filtered.filter((p) => p.status === params.status);
  }

  // Filtro por método
  if (params?.metodo) {
    filtered = filtered.filter(
      (p) => p.metodo?.toLowerCase() === params.metodo?.toLowerCase()
    );
  }

  // Filtro por curso
  if (params?.cursoId) {
    filtered = filtered.filter((p) => p.curso?.id === params.cursoId);
  }

  // Filtro por turma
  if (params?.turmaId) {
    filtered = filtered.filter((p) => p.turma?.id === params.turmaId);
  }

  // Filtro por valor mínimo
  if (params?.valorMin !== undefined) {
    filtered = filtered.filter((p) => (p.valor || 0) >= params.valorMin!);
  }

  // Filtro por valor máximo
  if (params?.valorMax !== undefined) {
    filtered = filtered.filter((p) => (p.valor || 0) <= params.valorMax!);
  }

  // Filtro por data início
  if (params?.dataInicio) {
    const dataInicio = new Date(params.dataInicio);
    filtered = filtered.filter(
      (p) => new Date(p.criadoEm) >= dataInicio
    );
  }

  // Filtro por data fim
  if (params?.dataFim) {
    const dataFim = new Date(params.dataFim);
    dataFim.setHours(23, 59, 59, 999);
    filtered = filtered.filter((p) => new Date(p.criadoEm) <= dataFim);
  }

  // Ordenar por data (mais recente primeiro)
  filtered.sort(
    (a, b) =>
      new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
  );

  // Paginação
  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginated = filtered.slice(startIndex, endIndex);

  return {
    pagamentos: paginated,
    resumo: calculateResumo(mockPagamentos),
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
    },
  };
}

