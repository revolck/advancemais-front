/**
 * Tipos para o módulo de Notificações
 */

export type NotificacaoStatus = "NAO_LIDA" | "LIDA" | "ARQUIVADA";

export type NotificacaoPrioridade = "BAIXA" | "NORMAL" | "ALTA" | "URGENTE";

export type NotificacaoTipo =
  | "VAGA_REJEITADA"
  | "VAGA_APROVADA"
  | "NOVO_CANDIDATO"
  | "VAGA_PREENCHIDA"
  | "PLANO_EXPIRANDO"
  | "PLANO_EXPIRADO"
  | "ASSINATURA_RENOVADA"
  | "PAGAMENTO_APROVADO"
  | "PAGAMENTO_RECUSADO"
  | "SISTEMA";

export interface NotificacaoVaga {
  id: string;
  titulo: string;
  codigo: string;
}

export interface Notificacao {
  id: string;
  tipo: NotificacaoTipo;
  status: NotificacaoStatus;
  prioridade: NotificacaoPrioridade;
  titulo: string;
  mensagem: string;
  dados?: Record<string, unknown> | null;
  linkAcao?: string | null;
  lidaEm?: string | null;
  criadoEm: string;
  expiraEm?: string | null;
  vaga?: NotificacaoVaga | null;
}

export interface ListarNotificacoesParams {
  page?: number;
  pageSize?: number;
  status?: NotificacaoStatus[];
  tipo?: NotificacaoTipo[];
  prioridade?: NotificacaoPrioridade[];
  apenasNaoLidas?: boolean;
}

export interface ListarNotificacoesResponse {
  success: boolean;
  data: Notificacao[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  contadores: {
    naoLidas: number;
    total: number;
  };
}

export interface ContadorNotificacoesResponse {
  success: boolean;
  naoLidas: number;
}

export interface MarcarNotificacoesPayload {
  notificacaoIds: string[];
}

export interface MarcarNotificacoesResponse {
  success: boolean;
  marcadas: number;
}

export interface ArquivarNotificacoesResponse {
  success: boolean;
  arquivadas: number;
}

