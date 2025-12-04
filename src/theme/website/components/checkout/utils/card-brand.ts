// src/theme/website/components/checkout/utils/card-brand.ts

import type { CardBrand } from "../types";

/**
 * Detecta a bandeira do cartão pelo número
 */
export function detectCardBrand(cardNumber: string): CardBrand {
  const number = cardNumber.replace(/\s/g, "");

  if (!number) return "unknown";

  // Visa: começa com 4
  if (/^4/.test(number)) return "visa";

  // Mastercard: 51-55 ou 2221-2720
  if (/^5[1-5]/.test(number) || /^2[2-7]/.test(number)) return "mastercard";

  // Elo: vários ranges
  if (
    /^(636368|438935|504175|451416|636297|5067|4576|4011|506699)/.test(number)
  )
    return "elo";

  // American Express: 34 ou 37
  if (/^3[47]/.test(number)) return "amex";

  // Hipercard: 606282
  if (/^606282/.test(number)) return "hipercard";

  // Diners Club: 300-305, 36, 38
  if (/^3(?:0[0-5]|[68])/.test(number)) return "diners";

  // Discover: 6011, 622126-622925, 644-649, 65
  if (/^6(?:011|5|4[4-9]|22)/.test(number)) return "discover";

  // JCB: 3528-3589
  if (/^35(?:2[89]|[3-8])/.test(number)) return "jcb";

  return "unknown";
}

