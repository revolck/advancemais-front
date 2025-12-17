/**
 * Mock Transações/Assinaturas Data
 * TODO: Remover quando a API real estiver disponível
 */

import type { AuditoriaTransacao } from "@/api/auditoria/types";

// Gera uma data no passado
const getPastDate = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(Math.floor(Math.random() * 24));
  date.setMinutes(Math.floor(Math.random() * 60));
  return date.toISOString();
};

// IDs mockados
const mockUsuarioIds = [
  "550e8400-e29b-41d4-a716-446655440001",
  "550e8400-e29b-41d4-a716-446655440002",
  "550e8400-e29b-41d4-a716-446655440003",
  "550e8400-e29b-41d4-a716-446655440004",
  "550e8400-e29b-41d4-a716-446655440005",
];

const mockEmpresaIds = [
  "empresa-001",
  "empresa-002",
  "empresa-003",
  "empresa-004",
  "empresa-005",
];

const mockCursos = [
  "Desenvolvimento Web Full Stack",
  "UX/UI Design",
  "Data Science",
  "Marketing Digital",
  "Gestão de Projetos",
];

const mockPlanos = [
  "Plano Básico",
  "Plano Empresarial",
  "Plano Premium",
  "Plano Corporativo",
];

const formasPagamento = [
  "PIX",
  "Boleto",
  "Cartão de Crédito",
  "Cartão de Débito",
];

// Dados mockados de transações
export const mockTransacoes: AuditoriaTransacao[] = [
  // USUÁRIO COMPRA CURSO - PIX
  {
    id: "trans-001",
    tipo: "PAGAMENTO",
    status: "APROVADA",
    valor: 299.90,
    moeda: "BRL",
    usuarioId: mockUsuarioIds[0],
    gateway: "PIX",
    gatewayId: "pix-001",
    descricao: `Compra do curso '${mockCursos[0]}' por João Silva`,
    dadosAdicionais: {
      curso: mockCursos[0],
      cursoId: "curso-001",
      usuarioNome: "João Silva",
    },
    criadoEm: getPastDate(1),
    atualizadoEm: getPastDate(1),
  },
  
  // USUÁRIO COMPRA CURSO - BOLETO
  {
    id: "trans-002",
    tipo: "PAGAMENTO",
    status: "PENDENTE",
    valor: 499.90,
    moeda: "BRL",
    usuarioId: mockUsuarioIds[1],
    gateway: "Boleto",
    gatewayId: "boleto-001",
    descricao: `Compra do curso '${mockCursos[1]}' por Maria Santos`,
    dadosAdicionais: {
      curso: mockCursos[1],
      cursoId: "curso-002",
      usuarioNome: "Maria Santos",
    },
    criadoEm: getPastDate(2),
    atualizadoEm: getPastDate(2),
  },
  
  // USUÁRIO COMPRA CURSO - CARTÃO DE CRÉDITO
  {
    id: "trans-003",
    tipo: "PAGAMENTO",
    status: "APROVADA",
    valor: 799.90,
    moeda: "BRL",
    usuarioId: mockUsuarioIds[2],
    gateway: "Cartão de Crédito",
    gatewayId: "cc-001",
    descricao: `Compra do curso '${mockCursos[2]}' por Carlos Oliveira`,
    dadosAdicionais: {
      curso: mockCursos[2],
      cursoId: "curso-003",
      usuarioNome: "Carlos Oliveira",
    },
    criadoEm: getPastDate(3),
    atualizadoEm: getPastDate(3),
  },
  
  // USUÁRIO COMPRA CURSO - CARTÃO DE DÉBITO
  {
    id: "trans-004",
    tipo: "PAGAMENTO",
    status: "APROVADA",
    valor: 399.90,
    moeda: "BRL",
    usuarioId: mockUsuarioIds[3],
    gateway: "Cartão de Débito",
    gatewayId: "cd-001",
    descricao: `Compra do curso '${mockCursos[3]}' por Ana Costa`,
    dadosAdicionais: {
      curso: mockCursos[3],
      cursoId: "curso-004",
      usuarioNome: "Ana Costa",
    },
    criadoEm: getPastDate(4),
    atualizadoEm: getPastDate(4),
  },
  
  // USUÁRIO COMPRA CURSO - FALHA NA TRANSAÇÃO (RECUSADA)
  {
    id: "trans-005",
    tipo: "PAGAMENTO",
    status: "RECUSADA",
    valor: 599.90,
    moeda: "BRL",
    usuarioId: mockUsuarioIds[4],
    gateway: "Cartão de Crédito",
    gatewayId: "cc-002",
    descricao: `Tentativa de compra do curso '${mockCursos[4]}' por Pedro Alves - Transação recusada`,
    dadosAdicionais: {
      curso: mockCursos[4],
      cursoId: "curso-005",
      usuarioNome: "Pedro Alves",
      motivoRecusa: "Cartão sem limite disponível",
    },
    criadoEm: getPastDate(5),
    atualizadoEm: getPastDate(5),
  },
  
  // USUÁRIO COMPRA CURSO - FALHA NA TRANSAÇÃO (CANCELADA)
  {
    id: "trans-006",
    tipo: "PAGAMENTO",
    status: "CANCELADA",
    valor: 349.90,
    moeda: "BRL",
    usuarioId: mockUsuarioIds[0],
    gateway: "PIX",
    gatewayId: "pix-002",
    descricao: `Compra do curso '${mockCursos[0]}' por João Silva - Transação cancelada`,
    dadosAdicionais: {
      curso: mockCursos[0],
      cursoId: "curso-001",
      usuarioNome: "João Silva",
      motivoCancelamento: "Cancelado pelo usuário",
    },
    criadoEm: getPastDate(6),
    atualizadoEm: getPastDate(6),
  },
  
  // EMPRESA COMPRA PLANO - PIX
  {
    id: "trans-007",
    tipo: "ASSINATURA",
    status: "APROVADA",
    valor: 999.90,
    moeda: "BRL",
    empresaId: mockEmpresaIds[0],
    gateway: "PIX",
    gatewayId: "pix-003",
    descricao: `Assinatura do '${mockPlanos[1]}' pela empresa Tech Solutions LTDA`,
    dadosAdicionais: {
      plano: mockPlanos[1],
      planoId: "plano-001",
      empresaNome: "Tech Solutions LTDA",
    },
    criadoEm: getPastDate(7),
    atualizadoEm: getPastDate(7),
  },
  
  // EMPRESA COMPRA PLANO - CARTÃO DE CRÉDITO
  {
    id: "trans-008",
    tipo: "ASSINATURA",
    status: "APROVADA",
    valor: 1499.90,
    moeda: "BRL",
    empresaId: mockEmpresaIds[1],
    gateway: "Cartão de Crédito",
    gatewayId: "cc-003",
    descricao: `Assinatura do '${mockPlanos[2]}' pela empresa Digital Innovations`,
    dadosAdicionais: {
      plano: mockPlanos[2],
      planoId: "plano-002",
      empresaNome: "Digital Innovations",
    },
    criadoEm: getPastDate(8),
    atualizadoEm: getPastDate(8),
  },
  
  // EMPRESA COMPRA PLANO - BOLETO
  {
    id: "trans-009",
    tipo: "ASSINATURA",
    status: "PENDENTE",
    valor: 799.90,
    moeda: "BRL",
    empresaId: mockEmpresaIds[2],
    gateway: "Boleto",
    gatewayId: "boleto-002",
    descricao: `Assinatura do '${mockPlanos[0]}' pela empresa StartupXYZ`,
    dadosAdicionais: {
      plano: mockPlanos[0],
      planoId: "plano-003",
      empresaNome: "StartupXYZ",
    },
    criadoEm: getPastDate(9),
    atualizadoEm: getPastDate(9),
  },
  
  // EMPRESA COMPRA PLANO - FALHA NA TRANSAÇÃO
  {
    id: "trans-010",
    tipo: "ASSINATURA",
    status: "RECUSADA",
    valor: 1999.90,
    moeda: "BRL",
    empresaId: mockEmpresaIds[3],
    gateway: "Cartão de Crédito",
    gatewayId: "cc-004",
    descricao: `Tentativa de assinatura do '${mockPlanos[3]}' pela empresa CorpTech - Transação recusada`,
    dadosAdicionais: {
      plano: mockPlanos[3],
      planoId: "plano-004",
      empresaNome: "CorpTech",
      motivoRecusa: "Dados do cartão inválidos",
    },
    criadoEm: getPastDate(10),
    atualizadoEm: getPastDate(10),
  },
  
  // RENOVAÇÃO DE PLANO - APROVADA
  {
    id: "trans-011",
    tipo: "ASSINATURA",
    status: "APROVADA",
    valor: 999.90,
    moeda: "BRL",
    empresaId: mockEmpresaIds[0],
    gateway: "Cartão de Crédito",
    gatewayId: "cc-005",
    descricao: `Renovação do '${mockPlanos[1]}' pela empresa Tech Solutions LTDA`,
    dadosAdicionais: {
      plano: mockPlanos[1],
      planoId: "plano-001",
      empresaNome: "Tech Solutions LTDA",
      tipoOperacao: "renovacao",
    },
    criadoEm: getPastDate(11),
    atualizadoEm: getPastDate(11),
  },
  
  // RENOVAÇÃO DE PLANO - FALHA NA TRANSAÇÃO
  {
    id: "trans-012",
    tipo: "ASSINATURA",
    status: "RECUSADA",
    valor: 1499.90,
    moeda: "BRL",
    empresaId: mockEmpresaIds[1],
    gateway: "Cartão de Crédito",
    gatewayId: "cc-006",
    descricao: `Tentativa de renovação do '${mockPlanos[2]}' pela empresa Digital Innovations - Transação recusada`,
    dadosAdicionais: {
      plano: mockPlanos[2],
      planoId: "plano-002",
      empresaNome: "Digital Innovations",
      tipoOperacao: "renovacao",
      motivoRecusa: "Cartão expirado",
    },
    criadoEm: getPastDate(12),
    atualizadoEm: getPastDate(12),
  },
  
  // RENOVAÇÃO DE PLANO - PIX
  {
    id: "trans-013",
    tipo: "ASSINATURA",
    status: "APROVADA",
    valor: 799.90,
    moeda: "BRL",
    empresaId: mockEmpresaIds[2],
    gateway: "PIX",
    gatewayId: "pix-004",
    descricao: `Renovação do '${mockPlanos[0]}' pela empresa StartupXYZ`,
    dadosAdicionais: {
      plano: mockPlanos[0],
      planoId: "plano-003",
      empresaNome: "StartupXYZ",
      tipoOperacao: "renovacao",
    },
    criadoEm: getPastDate(13),
    atualizadoEm: getPastDate(13),
  },
  
  // USUÁRIO COMPRA CURSO - PROCESSANDO
  {
    id: "trans-014",
    tipo: "PAGAMENTO",
    status: "PROCESSANDO",
    valor: 449.90,
    moeda: "BRL",
    usuarioId: mockUsuarioIds[1],
    gateway: "Boleto",
    gatewayId: "boleto-003",
    descricao: `Compra do curso '${mockCursos[1]}' por Maria Santos - Aguardando pagamento`,
    dadosAdicionais: {
      curso: mockCursos[1],
      cursoId: "curso-002",
      usuarioNome: "Maria Santos",
    },
    criadoEm: getPastDate(14),
    atualizadoEm: getPastDate(14),
  },
  
  // USUÁRIO COMPRA CURSO - CARTÃO DE DÉBITO
  {
    id: "trans-015",
    tipo: "PAGAMENTO",
    status: "APROVADA",
    valor: 649.90,
    moeda: "BRL",
    usuarioId: mockUsuarioIds[2],
    gateway: "Cartão de Débito",
    gatewayId: "cd-002",
    descricao: `Compra do curso '${mockCursos[2]}' por Carlos Oliveira`,
    dadosAdicionais: {
      curso: mockCursos[2],
      cursoId: "curso-003",
      usuarioNome: "Carlos Oliveira",
    },
    criadoEm: getPastDate(15),
    atualizadoEm: getPastDate(15),
  },
  
  // EMPRESA COMPRA PLANO - CARTÃO DE DÉBITO
  {
    id: "trans-016",
    tipo: "ASSINATURA",
    status: "APROVADA",
    valor: 1199.90,
    moeda: "BRL",
    empresaId: mockEmpresaIds[4],
    gateway: "Cartão de Débito",
    gatewayId: "cd-003",
    descricao: `Assinatura do '${mockPlanos[1]}' pela empresa Inovação Tech`,
    dadosAdicionais: {
      plano: mockPlanos[1],
      planoId: "plano-001",
      empresaNome: "Inovação Tech",
    },
    criadoEm: getPastDate(16),
    atualizadoEm: getPastDate(16),
  },
  
  // RENOVAÇÃO DE PLANO - BOLETO
  {
    id: "trans-017",
    tipo: "ASSINATURA",
    status: "PENDENTE",
    valor: 999.90,
    moeda: "BRL",
    empresaId: mockEmpresaIds[0],
    gateway: "Boleto",
    gatewayId: "boleto-004",
    descricao: `Renovação do '${mockPlanos[1]}' pela empresa Tech Solutions LTDA - Aguardando pagamento`,
    dadosAdicionais: {
      plano: mockPlanos[1],
      planoId: "plano-001",
      empresaNome: "Tech Solutions LTDA",
      tipoOperacao: "renovacao",
    },
    criadoEm: getPastDate(17),
    atualizadoEm: getPastDate(17),
  },
  
  // USUÁRIO COMPRA CURSO - PIX
  {
    id: "trans-018",
    tipo: "PAGAMENTO",
    status: "APROVADA",
    valor: 899.90,
    moeda: "BRL",
    usuarioId: mockUsuarioIds[3],
    gateway: "PIX",
    gatewayId: "pix-005",
    descricao: `Compra do curso '${mockCursos[3]}' por Ana Costa`,
    dadosAdicionais: {
      curso: mockCursos[3],
      cursoId: "curso-004",
      usuarioNome: "Ana Costa",
    },
    criadoEm: getPastDate(18),
    atualizadoEm: getPastDate(18),
  },
  
  // EMPRESA COMPRA PLANO - FALHA (CANCELADA)
  {
    id: "trans-019",
    tipo: "ASSINATURA",
    status: "CANCELADA",
    valor: 1999.90,
    moeda: "BRL",
    empresaId: mockEmpresaIds[3],
    gateway: "Cartão de Crédito",
    gatewayId: "cc-007",
    descricao: `Assinatura do '${mockPlanos[3]}' pela empresa CorpTech - Transação cancelada`,
    dadosAdicionais: {
      plano: mockPlanos[3],
      planoId: "plano-004",
      empresaNome: "CorpTech",
      motivoCancelamento: "Cancelado pela empresa",
    },
    criadoEm: getPastDate(19),
    atualizadoEm: getPastDate(19),
  },
  
  // USUÁRIO COMPRA CURSO - CARTÃO DE CRÉDITO
  {
    id: "trans-020",
    tipo: "PAGAMENTO",
    status: "APROVADA",
    valor: 549.90,
    moeda: "BRL",
    usuarioId: mockUsuarioIds[4],
    gateway: "Cartão de Crédito",
    gatewayId: "cc-008",
    descricao: `Compra do curso '${mockCursos[4]}' por Pedro Alves`,
    dadosAdicionais: {
      curso: mockCursos[4],
      cursoId: "curso-005",
      usuarioNome: "Pedro Alves",
    },
    criadoEm: getPastDate(20),
    atualizadoEm: getPastDate(20),
  },
  
  // RENOVAÇÃO DE PLANO - CARTÃO DE CRÉDITO
  {
    id: "trans-021",
    tipo: "ASSINATURA",
    status: "APROVADA",
    valor: 1499.90,
    moeda: "BRL",
    empresaId: mockEmpresaIds[1],
    gateway: "Cartão de Crédito",
    gatewayId: "cc-009",
    descricao: `Renovação do '${mockPlanos[2]}' pela empresa Digital Innovations`,
    dadosAdicionais: {
      plano: mockPlanos[2],
      planoId: "plano-002",
      empresaNome: "Digital Innovations",
      tipoOperacao: "renovacao",
    },
    criadoEm: getPastDate(21),
    atualizadoEm: getPastDate(21),
  },
  
  // USUÁRIO COMPRA CURSO - BOLETO APROVADO
  {
    id: "trans-022",
    tipo: "PAGAMENTO",
    status: "APROVADA",
    valor: 379.90,
    moeda: "BRL",
    usuarioId: mockUsuarioIds[0],
    gateway: "Boleto",
    gatewayId: "boleto-005",
    descricao: `Compra do curso '${mockCursos[0]}' por João Silva`,
    dadosAdicionais: {
      curso: mockCursos[0],
      cursoId: "curso-001",
      usuarioNome: "João Silva",
    },
    criadoEm: getPastDate(22),
    atualizadoEm: getPastDate(22),
  },
  
  // EMPRESA COMPRA PLANO - PIX
  {
    id: "trans-023",
    tipo: "ASSINATURA",
    status: "APROVADA",
    valor: 899.90,
    moeda: "BRL",
    empresaId: mockEmpresaIds[4],
    gateway: "PIX",
    gatewayId: "pix-006",
    descricao: `Assinatura do '${mockPlanos[0]}' pela empresa Inovação Tech`,
    dadosAdicionais: {
      plano: mockPlanos[0],
      planoId: "plano-003",
      empresaNome: "Inovação Tech",
    },
    criadoEm: getPastDate(23),
    atualizadoEm: getPastDate(23),
  },
  
  // RENOVAÇÃO DE PLANO - FALHA (PROCESSANDO E DEPOIS RECUSADA)
  {
    id: "trans-024",
    tipo: "ASSINATURA",
    status: "RECUSADA",
    valor: 799.90,
    moeda: "BRL",
    empresaId: mockEmpresaIds[2],
    gateway: "Cartão de Crédito",
    gatewayId: "cc-010",
    descricao: `Tentativa de renovação do '${mockPlanos[0]}' pela empresa StartupXYZ - Transação recusada`,
    dadosAdicionais: {
      plano: mockPlanos[0],
      planoId: "plano-003",
      empresaNome: "StartupXYZ",
      tipoOperacao: "renovacao",
      motivoRecusa: "Saldo insuficiente",
    },
    criadoEm: getPastDate(24),
    atualizadoEm: getPastDate(24),
  },
  
  // USUÁRIO COMPRA CURSO - PIX
  {
    id: "trans-025",
    tipo: "PAGAMENTO",
    status: "APROVADA",
    valor: 699.90,
    moeda: "BRL",
    usuarioId: mockUsuarioIds[1],
    gateway: "PIX",
    gatewayId: "pix-007",
    descricao: `Compra do curso '${mockCursos[1]}' por Maria Santos`,
    dadosAdicionais: {
      curso: mockCursos[1],
      cursoId: "curso-002",
      usuarioNome: "Maria Santos",
    },
    criadoEm: getPastDate(25),
    atualizadoEm: getPastDate(25),
  },
];

/**
 * Simula uma resposta paginada da API de transações
 */
export function getMockTransacoesResponse(
  filters?: {
    tipo?: string | string[];
    status?: string | string[];
    usuarioId?: string;
    empresaId?: string;
    gateway?: string;
    page?: number;
    pageSize?: number;
  }
) {
  let filteredTransacoes = [...mockTransacoes];

  // Filtrar por tipo
  if (filters?.tipo) {
    const tipos = Array.isArray(filters.tipo)
      ? filters.tipo
      : [filters.tipo];
    filteredTransacoes = filteredTransacoes.filter((trans) =>
      tipos.includes(trans.tipo)
    );
  }

  // Filtrar por status
  if (filters?.status) {
    const statuses = Array.isArray(filters.status)
      ? filters.status
      : [filters.status];
    filteredTransacoes = filteredTransacoes.filter((trans) =>
      statuses.includes(trans.status)
    );
  }

  // Filtrar por usuário
  if (filters?.usuarioId) {
    filteredTransacoes = filteredTransacoes.filter(
      (trans) => trans.usuarioId === filters.usuarioId
    );
  }

  // Filtrar por empresa
  if (filters?.empresaId) {
    filteredTransacoes = filteredTransacoes.filter(
      (trans) => trans.empresaId === filters.empresaId
    );
  }

  // Filtrar por gateway (forma de pagamento)
  if (filters?.gateway) {
    filteredTransacoes = filteredTransacoes.filter(
      (trans) => trans.gateway === filters.gateway
    );
  }

  // Paginação
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 10;
  const total = filteredTransacoes.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedTransacoes = filteredTransacoes.slice(startIndex, endIndex);

  return {
    items: paginatedTransacoes,
    total,
    page,
    pageSize,
    totalPages,
  };
}

