// src/theme/website/components/checkout/types/index.ts

export type PaymentMethod = "credit" | "debit" | "pix" | "boleto";

export type CardBrand =
  | "visa"
  | "mastercard"
  | "elo"
  | "amex"
  | "hipercard"
  | "diners"
  | "discover"
  | "jcb"
  | "unknown";

export interface CheckoutViewProps {
  sessionId: string;
  securityToken?: string;
  refTimestamp?: string;
  planSlug?: string;
  className?: string;
}

// Tipo de desconto do cupom
export type CouponDiscountType = "percentage" | "fixed";

// Tipo de uso do cupom
export type CouponUsageType = "first_purchase" | "unlimited" | "limited";

// Interface do cupom retornado pela API
export interface Coupon {
  id: string;
  code: string;
  discountType: CouponDiscountType; // "percentage" ou "fixed"
  discountValue: number; // Ex: 10 para 10% ou 10.00 para R$ 10,00
  usageType: CouponUsageType; // "first_purchase", "unlimited" ou "limited"
  usageLimit?: number; // Limite de uso por usuário (quando usageType é "limited")
  userUsageCount?: number; // Quantas vezes o usuário já usou este cupom
  minPurchaseAmount?: number; // Valor mínimo de compra
  maxDiscountAmount?: number; // Valor máximo de desconto (para porcentagem)
  validFrom?: string; // Data de início da validade
  validUntil?: string; // Data de fim da validade
  isActive: boolean;
  applicableProducts?: string[]; // IDs de produtos aplicáveis (vazio = todos)
}

// Cupom aplicado com o desconto calculado
export interface AppliedCoupon {
  code: string;
  discount: number; // Valor calculado do desconto
  discountType: CouponDiscountType;
  discountValue: number; // Valor original (% ou R$)
}
