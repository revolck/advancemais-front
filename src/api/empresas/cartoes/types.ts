/**
 * Tipos para o módulo de Cartões da Empresa
 * Baseado na documentação da API de Pagamentos Recorrentes
 */

export type TipoCartao = "credito" | "debito";

export type BandeiraCartao =
  | "visa"
  | "mastercard"
  | "amex"
  | "elo"
  | "hipercard"
  | "diners"
  | "discover"
  | "jcb"
  | "unknown";

export interface CartaoEmpresa {
  id: string;
  empresaId: string;

  // Dados públicos (não sensíveis)
  ultimos4Digitos: string;
  bandeira: BandeiraCartao;
  tipo: TipoCartao;
  nomeNoCartao: string;
  mesExpiracao: number;
  anoExpiracao: number;

  // Controle
  isPadrao: boolean;
  isAtivo: boolean;
  validadoEm: string | null;
  falhasConsecutivas: number;

  criadoEm: string;
  atualizadoEm: string;
}

// Request para adicionar cartão
export interface AdicionarCartaoPayload {
  /** Token gerado pelo SDK do Mercado Pago no frontend */
  token: string;
  /** Tipo do cartão: crédito ou débito */
  tipo: TipoCartao;
  /** Se deve ser definido como cartão padrão */
  isPadrao?: boolean;
}

// Response ao adicionar cartão
export interface AdicionarCartaoResponse {
  success: boolean;
  data: {
    cartao: CartaoEmpresa;
    validacao: {
      sucesso: boolean;
      mensagem: string;
    };
    /** Informação sobre pagamento pendente (se houver) */
    pagamentoPendente?: {
      valor: number;
      valorFormatado: string;
      vencimento: string;
      planoNome: string;
      perguntarSeDesejaPagar: boolean;
    };
  };
  message?: string;
}

// Response para listar cartões
export interface ListarCartoesResponse {
  success: boolean;
  data: CartaoEmpresa[];
}

// Response para ações simples (definir padrão, remover)
export interface CartaoActionResponse {
  success: boolean;
  message: string;
  data?: CartaoEmpresa;
}

// Response para pagar pendente
export interface PagarPendenteResponse {
  success: boolean;
  data: {
    pagamento: {
      id: string;
      status: string;
      valor: number;
      valorFormatado: string;
    };
    plano: {
      id: string;
      status: string;
      proximaCobranca: string;
    };
  };
  message?: string;
}

// Preferência de pagamento
export type MetodoPagamentoPreferido =
  | "CARTAO_CREDITO"
  | "CARTAO_DEBITO"
  | "PIX"
  | "BOLETO";

export interface PreferenciaPagamento {
  metodo: MetodoPagamentoPreferido;
  cartao?: CartaoEmpresa;
  proximaCobranca: string | null;
  valorProximaCobranca: number;
  historicoFalhas: number;
}

export interface PreferenciaPagamentoResponse {
  success: boolean;
  data: PreferenciaPagamento;
}

export interface AtualizarPreferenciaPayload {
  metodo: MetodoPagamentoPreferido;
  cartaoId?: string;
}

