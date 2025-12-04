/**
 * Mercado Pago SDK Integration
 * 
 * Este módulo centraliza a integração com o SDK do Mercado Pago
 * para tokenização de cartões no frontend.
 * 
 * Uso:
 * - Assinaturas de empresas (cartão tokenizado)
 * - Pagamentos únicos de cursos (futuro)
 * - Qualquer pagamento com cartão de crédito/débito
 */

export { MercadoPagoProvider, useMercadoPago } from "./provider";
export { useCardToken } from "./useCardToken";
export type { CardData, CardTokenResult, MercadoPagoContextValue } from "./types";

