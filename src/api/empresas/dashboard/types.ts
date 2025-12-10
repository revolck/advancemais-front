/**
 * Tipos para o módulo de Visão Geral da Empresa
 */

export interface EmpresaDados {
  id: string;
  nome: string;
  email: string;
  cnpj: string | null;
  telefone: string | null;
  cidade: string | null;
  estado: string | null;
}

export interface EmpresaPlano {
  id: string;
  nome: string;
  status: "ATIVO" | "SUSPENSO" | "EXPIRADO" | "CANCELADO";
  statusPagamento: string | null;
  inicio: string | null;
  fim: string | null;
  proximaCobranca: string | null;
  graceUntil: string | null;
  quantidadeVagas: number;
  vagasUtilizadas: number;
  vagasDisponiveis: number;
  // Campos de destaque
  permiteDestaque: boolean;
  quantidadeDestaquesPlano: number;
  destaquesUtilizados: number;
  destaquesDisponiveis: number;
}

export interface ResumoVagas {
  total: number;
  publicadas: number;
  rascunho: number;
  encerradas: number;
  emAnalise: number;
}

export interface CandidaturaRecente {
  id: string;
  candidatoNome: string;
  vagaTitulo: string;
  vagaCodigo: string;
  status: string;
  aplicadaEm: string;
}

export interface NotificacaoRecente {
  id: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  status: "LIDA" | "NAO_LIDA" | "ARQUIVADA";
  criadoEm: string;
}

export interface EmpresaEstatisticas {
  totalCandidaturas: number;
  candidaturasNovas: number;
  taxaVisualizacao: number;
}

export interface VisaoGeralData {
  empresa: EmpresaDados;
  plano: EmpresaPlano | null;
  resumoVagas: ResumoVagas;
  candidaturasRecentes: CandidaturaRecente[];
  notificacoesRecentes: NotificacaoRecente[];
  estatisticas: EmpresaEstatisticas;
}

export interface VisaoGeralResponse {
  success: boolean;
  data: VisaoGeralData;
}

export interface VisaoGeralParams {
  empresaId?: string;
}
