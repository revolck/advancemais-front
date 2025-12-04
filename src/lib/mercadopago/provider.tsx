"use client";

/**
 * Mercado Pago Provider
 * 
 * Inicializa o SDK JavaScript do Mercado Pago e fornece métodos de tokenização
 * para componentes filhos via Context API.
 * 
 * Usa o SDK JS puro (não o SDK React) para permitir tokenização manual
 * com campos de formulário customizados.
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from "react";
import { env } from "@/lib/env";
import type { CardData, CardTokenResult, MercadoPagoContextValue } from "./types";

// Tipo para o SDK do Mercado Pago
interface MercadoPagoSDK {
  createCardToken: (cardData: {
    cardNumber: string;
    cardholderName: string;
    cardExpirationMonth: string;
    cardExpirationYear: string;
    securityCode: string;
    identificationType: string;
    identificationNumber: string;
  }) => Promise<{
    id: string;
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
  }>;
}

// Declaração global para o SDK
declare global {
  interface Window {
    MercadoPago?: new (publicKey: string, options?: { locale: string }) => MercadoPagoSDK;
  }
}

// Contexto
const MercadoPagoContext = createContext<MercadoPagoContextValue | null>(null);

interface MercadoPagoProviderProps {
  children: React.ReactNode;
  /** Locale para o SDK (default: pt-BR) */
  locale?: "pt-BR" | "es-AR" | "es-MX" | "en-US";
}

/**
 * Provider que inicializa o SDK do Mercado Pago
 */
export function MercadoPagoProvider({ 
  children, 
  locale = "pt-BR" 
}: MercadoPagoProviderProps) {
  const [isReady, setIsReady] = useState(false);
  const mpInstanceRef = useRef<MercadoPagoSDK | null>(null);
  const publicKey = env.mercadoPagoPublicKey;
  const isTestMode = publicKey.startsWith("TEST-");

  // Carrega o SDK do Mercado Pago
  useEffect(() => {
    if (!publicKey || publicKey === "TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx") {
      console.warn("[MercadoPago] Public Key não configurada");
      return;
    }

    // Verifica se o script já foi carregado
    if (window.MercadoPago) {
      try {
        mpInstanceRef.current = new window.MercadoPago(publicKey, { locale });
        setIsReady(true);
        console.log("[MercadoPago] SDK já carregado, instância criada");
        return;
      } catch (error) {
        console.error("[MercadoPago] Erro ao criar instância:", error);
      }
    }

    // Carrega o script do SDK
    const existingScript = document.getElementById("mercadopago-sdk");
    if (existingScript) {
      // Script existe, espera carregar
      existingScript.addEventListener("load", () => {
        if (window.MercadoPago) {
          mpInstanceRef.current = new window.MercadoPago(publicKey, { locale });
          setIsReady(true);
          console.log("[MercadoPago] SDK carregado via evento");
        }
      });
      return;
    }

    // Cria e adiciona o script
    const script = document.createElement("script");
    script.id = "mercadopago-sdk";
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.async = true;

    script.onload = () => {
      if (window.MercadoPago) {
        try {
          mpInstanceRef.current = new window.MercadoPago(publicKey, { locale });
          setIsReady(true);
          console.log("[MercadoPago] SDK inicializado com sucesso", {
            isTestMode,
            publicKey: `${publicKey.slice(0, 20)}...`
          });
        } catch (error) {
          console.error("[MercadoPago] Erro ao criar instância:", error);
        }
      }
    };

    script.onerror = () => {
      console.error("[MercadoPago] Erro ao carregar SDK");
    };

    document.head.appendChild(script);

    return () => {
      // Não remove o script no cleanup para evitar recarregamentos
    };
  }, [publicKey, locale, isTestMode]);

  // Função para criar token de cartão
  const createCardToken = useCallback(async (cardData: CardData): Promise<CardTokenResult> => {
    if (!isReady || !mpInstanceRef.current) {
      return {
        success: false,
        error: "SDK do Mercado Pago não está pronto. Aguarde alguns segundos e tente novamente.",
        errorCode: "sdk_not_ready",
      };
    }

    try {
      // Prepara os dados no formato esperado pelo SDK
      const tokenData = {
        cardNumber: cardData.cardNumber.replace(/\s/g, ""),
        cardholderName: cardData.cardholderName.toUpperCase(),
        cardExpirationMonth: cardData.expirationMonth.padStart(2, "0"),
        cardExpirationYear: cardData.expirationYear.length === 2 
          ? `20${cardData.expirationYear}` 
          : cardData.expirationYear,
        securityCode: cardData.securityCode,
        identificationType: cardData.identificationType,
        identificationNumber: cardData.identificationNumber.replace(/\D/g, ""),
      };

      console.log("[MercadoPago] Criando token...", {
        cardNumber: `****${tokenData.cardNumber.slice(-4)}`,
        cardholderName: tokenData.cardholderName,
        expiration: `${tokenData.cardExpirationMonth}/${tokenData.cardExpirationYear}`,
      });

      const response = await mpInstanceRef.current.createCardToken(tokenData);

      if (response?.id) {
        console.log("[MercadoPago] Token criado com sucesso:", response.id.slice(0, 10) + "...");
        return {
          success: true,
          token: response.id,
          lastFourDigits: response.last_four_digits,
          cardBrand: detectBrandFromFirstSix(response.first_six_digits),
        };
      }

      return {
        success: false,
        error: "Não foi possível criar o token do cartão",
        errorCode: "card_token_creation_failed",
      };
    } catch (error: unknown) {
      console.error("[MercadoPago] Erro ao criar token:", error);

      // Trata erros específicos do SDK
      const errorMessage = parseSDKError(error);
      
      return {
        success: false,
        error: errorMessage.message,
        errorCode: errorMessage.code,
      };
    }
  }, [isReady]);

  // Memoiza o valor do contexto
  const contextValue = useMemo<MercadoPagoContextValue>(() => ({
    isReady,
    isTestMode,
    publicKey,
    createCardToken,
  }), [isReady, isTestMode, publicKey, createCardToken]);

  return (
    <MercadoPagoContext.Provider value={contextValue}>
      {children}
    </MercadoPagoContext.Provider>
  );
}

/**
 * Hook para acessar o contexto do Mercado Pago
 */
export function useMercadoPago(): MercadoPagoContextValue {
  const context = useContext(MercadoPagoContext);
  
  if (!context) {
    throw new Error(
      "useMercadoPago deve ser usado dentro de um MercadoPagoProvider"
    );
  }
  
  return context;
}

// =============================================
// Helpers
// =============================================

/**
 * Detecta a bandeira do cartão pelos primeiros 6 dígitos
 */
function detectBrandFromFirstSix(firstSix: string): string {
  const num = firstSix;
  
  if (/^4/.test(num)) return "visa";
  if (/^5[1-5]/.test(num) || /^2[2-7]/.test(num)) return "mastercard";
  if (/^3[47]/.test(num)) return "amex";
  if (/^6(?:011|5)/.test(num)) return "discover";
  if (/^(?:2131|1800|35)/.test(num)) return "jcb";
  if (/^3(?:0[0-5]|[68])/.test(num)) return "diners";
  if (/^(?:5066|509|6363|6504)/.test(num)) return "elo";
  if (/^(606282|3841)/.test(num)) return "hipercard";
  
  return "unknown";
}

/**
 * Parseia erros do SDK do Mercado Pago
 */
function parseSDKError(error: unknown): { message: string; code: string } {
  if (error && typeof error === "object") {
    const err = error as Record<string, unknown>;
    
    // Erros de validação do SDK
    if (Array.isArray(err.cause)) {
      const causes = err.cause as Array<{ code: string; description: string }>;
      
      for (const cause of causes) {
        const code = cause.code || String(cause);
        
        if (code === "205" || code === "E301") {
          return { message: "Número do cartão inválido", code: "invalid_card_number" };
        }
        if (code === "208" || code === "E302") {
          return { message: "Mês de validade inválido", code: "invalid_expiration_month" };
        }
        if (code === "209" || code === "E303") {
          return { message: "Ano de validade inválido", code: "invalid_expiration_year" };
        }
        if (code === "212" || code === "E304" || code === "325") {
          return { message: "Código de segurança (CVV) inválido", code: "invalid_security_code" };
        }
        if (code === "221" || code === "316") {
          return { message: "Nome do titular inválido", code: "invalid_cardholder_name" };
        }
        if (code === "324" || code === "E305") {
          return { message: "Documento do titular inválido", code: "invalid_identification" };
        }
        if (code === "E203") {
          return { message: "Cartão expirado", code: "expired_card" };
        }
      }
    }

    // Mensagem genérica do erro
    if (typeof err.message === "string") {
      return { message: err.message, code: "unknown_error" };
    }
    
    // Erro em formato string dentro de cause
    if (err.cause && typeof err.cause === "string") {
      return { message: err.cause, code: "sdk_error" };
    }
  }

  return { 
    message: "Erro ao processar dados do cartão. Verifique as informações e tente novamente.",
    code: "unknown_error" 
  };
}
