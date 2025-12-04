/**
 * Tipos para integração com Mercado Pago SDK
 */

/**
 * Dados do cartão para tokenização
 */
export interface CardData {
  /** Número do cartão (sem espaços) */
  cardNumber: string;
  /** Nome do titular como está no cartão */
  cardholderName: string;
  /** Mês de expiração (MM) */
  expirationMonth: string;
  /** Ano de expiração (YY ou YYYY) */
  expirationYear: string;
  /** Código de segurança (CVV) */
  securityCode: string;
  /** Tipo de documento do titular */
  identificationType: "CPF" | "CNPJ";
  /** Número do documento do titular */
  identificationNumber: string;
}

/**
 * Resultado da tokenização
 */
export interface CardTokenResult {
  /** Se a tokenização foi bem sucedida */
  success: boolean;
  /** Token gerado (se sucesso) */
  token?: string;
  /** Últimos 4 dígitos do cartão */
  lastFourDigits?: string;
  /** Bandeira do cartão */
  cardBrand?: string;
  /** Mensagem de erro (se falha) */
  error?: string;
  /** Código do erro */
  errorCode?: string;
}

/**
 * Informações do cartão retornadas pelo SDK
 */
export interface CardTokenResponse {
  id: string;
  public_key: string;
  first_six_digits: string;
  last_four_digits: string;
  expiration_month: number;
  expiration_year: number;
  cardholder: {
    name: string;
    identification: {
      type: string;
      number: string;
    };
  };
  status: string;
  date_created: string;
  date_last_updated: string;
  date_due: string;
  luhn_validation: boolean;
  live_mode: boolean;
  require_esc: boolean;
  card_number_length: number;
  security_code_length: number;
}

/**
 * Contexto do Mercado Pago Provider
 */
export interface MercadoPagoContextValue {
  /** Se o SDK está pronto para uso */
  isReady: boolean;
  /** Se está em ambiente de teste */
  isTestMode: boolean;
  /** Public Key utilizada */
  publicKey: string;
  /** Cria um token de cartão */
  createCardToken: (cardData: CardData) => Promise<CardTokenResult>;
}

/**
 * Tipos de erros do Mercado Pago
 */
export type MercadoPagoErrorCause = 
  | "invalid_card_number"
  | "invalid_expiration_date"
  | "invalid_security_code"
  | "invalid_cardholder_name"
  | "invalid_identification"
  | "card_token_creation_failed"
  | "sdk_not_ready"
  | "unknown_error";

/**
 * Estrutura de erro do SDK
 */
export interface MercadoPagoError {
  cause: MercadoPagoErrorCause[];
  message: string;
  status: number;
}

