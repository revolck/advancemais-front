"use client";

/**
 * Hook para tokenização de cartão
 * 
 * Simplifica o processo de tokenização encapsulando
 * a validação e chamada ao SDK.
 */

import { useState, useCallback } from "react";
import { useMercadoPago } from "./provider";
import type { CardData, CardTokenResult } from "./types";

interface UseCardTokenReturn {
  /** Cria um token a partir dos dados do cartão */
  tokenize: (cardData: CardData) => Promise<CardTokenResult>;
  /** Se está processando a tokenização */
  isTokenizing: boolean;
  /** Resultado da última tokenização */
  result: CardTokenResult | null;
  /** Erro da última tokenização */
  error: string | null;
  /** Limpa o estado */
  reset: () => void;
}

/**
 * Hook para tokenização de cartão
 * 
 * @example
 * ```tsx
 * const { tokenize, isTokenizing, error } = useCardToken();
 * 
 * const handleSubmit = async () => {
 *   const result = await tokenize({
 *     cardNumber: "4111111111111111",
 *     cardholderName: "FULANO DE TAL",
 *     expirationMonth: "12",
 *     expirationYear: "25",
 *     securityCode: "123",
 *     identificationType: "CPF",
 *     identificationNumber: "12345678900",
 *   });
 * 
 *   if (result.success) {
 *     // Enviar result.token para o backend
 *   }
 * };
 * ```
 */
export function useCardToken(): UseCardTokenReturn {
  const { createCardToken, isReady } = useMercadoPago();
  const [isTokenizing, setIsTokenizing] = useState(false);
  const [result, setResult] = useState<CardTokenResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const tokenize = useCallback(async (cardData: CardData): Promise<CardTokenResult> => {
    // Validações básicas antes de chamar o SDK
    const validationError = validateCardData(cardData);
    if (validationError) {
      const errorResult: CardTokenResult = {
        success: false,
        error: validationError,
        errorCode: "validation_error",
      };
      setError(validationError);
      setResult(errorResult);
      return errorResult;
    }

    if (!isReady) {
      const errorResult: CardTokenResult = {
        success: false,
        error: "SDK do Mercado Pago não está pronto. Aguarde ou recarregue a página.",
        errorCode: "sdk_not_ready",
      };
      setError(errorResult.error!);
      setResult(errorResult);
      return errorResult;
    }

    setIsTokenizing(true);
    setError(null);

    try {
      const tokenResult = await createCardToken(cardData);
      setResult(tokenResult);
      
      if (!tokenResult.success) {
        setError(tokenResult.error || "Erro desconhecido");
      }
      
      return tokenResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao tokenizar cartão";
      const errorResult: CardTokenResult = {
        success: false,
        error: errorMessage,
        errorCode: "tokenization_error",
      };
      setError(errorMessage);
      setResult(errorResult);
      return errorResult;
    } finally {
      setIsTokenizing(false);
    }
  }, [createCardToken, isReady]);

  const reset = useCallback(() => {
    setIsTokenizing(false);
    setResult(null);
    setError(null);
  }, []);

  return {
    tokenize,
    isTokenizing,
    result,
    error,
    reset,
  };
}

// =============================================
// Validações
// =============================================

/**
 * Valida os dados do cartão antes de tokenizar
 */
function validateCardData(data: CardData): string | null {
  // Número do cartão
  const cardNumber = data.cardNumber.replace(/\s/g, "");
  if (!cardNumber || cardNumber.length < 13 || cardNumber.length > 19) {
    return "Número do cartão inválido";
  }
  if (!/^\d+$/.test(cardNumber)) {
    return "Número do cartão deve conter apenas dígitos";
  }
  if (!luhnCheck(cardNumber)) {
    return "Número do cartão inválido";
  }

  // Nome do titular
  if (!data.cardholderName || data.cardholderName.trim().length < 3) {
    return "Nome do titular é obrigatório";
  }
  if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(data.cardholderName)) {
    return "Nome do titular deve conter apenas letras";
  }

  // Mês de expiração
  const month = parseInt(data.expirationMonth, 10);
  if (isNaN(month) || month < 1 || month > 12) {
    return "Mês de validade inválido";
  }

  // Ano de expiração
  const year = parseInt(data.expirationYear, 10);
  const currentYear = new Date().getFullYear();
  const fullYear = year < 100 ? 2000 + year : year;
  if (isNaN(fullYear) || fullYear < currentYear || fullYear > currentYear + 20) {
    return "Ano de validade inválido";
  }

  // Verifica se o cartão não está expirado
  const currentMonth = new Date().getMonth() + 1;
  if (fullYear === currentYear && month < currentMonth) {
    return "Cartão expirado";
  }

  // CVV
  if (!data.securityCode || data.securityCode.length < 3 || data.securityCode.length > 4) {
    return "Código de segurança (CVV) inválido";
  }
  if (!/^\d+$/.test(data.securityCode)) {
    return "CVV deve conter apenas dígitos";
  }

  // Documento
  const docNumber = data.identificationNumber.replace(/\D/g, "");
  if (data.identificationType === "CPF" && docNumber.length !== 11) {
    return "CPF deve ter 11 dígitos";
  }
  if (data.identificationType === "CNPJ" && docNumber.length !== 14) {
    return "CNPJ deve ter 14 dígitos";
  }

  return null;
}

/**
 * Algoritmo de Luhn para validação de número de cartão
 */
function luhnCheck(cardNumber: string): boolean {
  let sum = 0;
  let isEven = false;

  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

