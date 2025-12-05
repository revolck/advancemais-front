// src/theme/website/components/checkout/components/CardFormTokenized.tsx

"use client";

/**
 * CardForm com Tokenização do Mercado Pago
 *
 * Este componente coleta os dados do cartão e gera um token
 * via SDK do Mercado Pago para pagamento seguro.
 *
 * Uso:
 * - Assinaturas de empresas
 * - Pagamentos únicos de cursos (futuro)
 */

import React, { useState, useCallback, useEffect } from "react";
import { InputCustom } from "@/components/ui/custom/input";
import { CardBrandIcon } from "./CardBrandIcon";
import { detectCardBrand } from "../utils/card-brand";
import {
  formatCardNumber,
  formatExpiry,
  formatCVV,
} from "../utils/formatters";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Lock } from "lucide-react";
import { useCardToken } from "@/lib/mercadopago";
import type { CardData } from "@/lib/mercadopago";
import { cn } from "@/lib/utils";

export interface TokenizeResult {
  success: boolean;
  token?: string;
  lastFourDigits?: string;
  cardBrand?: string;
  error?: string;
}

interface CardFormTokenizedProps {
  /** Callback quando token é gerado com sucesso */
  onTokenGenerated: (
    token: string,
    lastFourDigits: string,
    cardBrand: string
  ) => void;
  /** Callback em caso de erro */
  onError?: (error: string) => void;
  /** Tipo de documento do pagador */
  documentType: "CPF" | "CNPJ";
  /** Número do documento do pagador (já validado) */
  documentNumber: string;
  /** Se o formulário está desabilitado */
  disabled?: boolean;
  /** Classe CSS adicional */
  className?: string;
  /** Ref para expor método de tokenização externamente - retorna resultado completo */
  tokenizeRef?: React.MutableRefObject<(() => Promise<TokenizeResult>) | null>;
}

export const CardFormTokenized: React.FC<CardFormTokenizedProps> = ({
  onTokenGenerated,
  onError,
  documentType,
  documentNumber,
  disabled = false,
  className,
  tokenizeRef,
}) => {
  // Estado dos campos
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVV, setCardCVV] = useState("");
  const [cardHolder, setCardHolder] = useState("");

  // Estado de validação visual
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Hook de tokenização
  const { tokenize, isTokenizing, error: tokenError } = useCardToken();

  // Limpa erro de campo quando usuário digita
  const clearFieldError = useCallback((field: string) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  // Valida campos antes de tokenizar
  const validateFields = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    const cleanCardNumber = cardNumber.replace(/\s/g, "");
    if (!cleanCardNumber || cleanCardNumber.length < 13) {
      errors.cardNumber = "Número do cartão inválido";
    }

    if (!cardHolder || cardHolder.trim().length < 3) {
      errors.cardHolder = "Nome do titular é obrigatório";
    }

    const [month, year] = cardExpiry.split("/");
    if (!month || !year || parseInt(month) < 1 || parseInt(month) > 12) {
      errors.cardExpiry = "Data de validade inválida";
    }

    if (!cardCVV || cardCVV.length < 3) {
      errors.cardCVV = "CVV inválido";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [cardNumber, cardHolder, cardExpiry, cardCVV]);

  // Função de tokenização - retorna resultado completo para uso externo
  const handleTokenize = useCallback(async (): Promise<TokenizeResult> => {
    if (!validateFields()) {
      return { success: false, error: "Preencha os dados do cartão corretamente" };
    }

    const [month, year] = cardExpiry.split("/");

    const cardData: CardData = {
      cardNumber: cardNumber.replace(/\s/g, ""),
      cardholderName: cardHolder,
      expirationMonth: month.padStart(2, "0"),
      expirationYear: year,
      securityCode: cardCVV,
      identificationType: documentType,
      identificationNumber: documentNumber,
    };

    const result = await tokenize(cardData);

    if (result.success && result.token) {
      const lastFour = result.lastFourDigits || cardNumber.slice(-4);
      const brand = result.cardBrand || detectCardBrand(cardNumber);
      
      onTokenGenerated(result.token, lastFour, brand);
      
      return {
        success: true,
        token: result.token,
        lastFourDigits: lastFour,
        cardBrand: brand,
      };
    } else {
      const errorMsg = result.error || "Erro ao processar cartão";
      onError?.(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [
    validateFields,
    cardExpiry,
    cardNumber,
    cardHolder,
    cardCVV,
    documentType,
    documentNumber,
    tokenize,
    onTokenGenerated,
    onError,
  ]);

  // Expõe método de tokenização via ref
  useEffect(() => {
    if (tokenizeRef) {
      tokenizeRef.current = handleTokenize;
    }
  }, [tokenizeRef, handleTokenize]);

  // Detecta a bandeira do cartão
  const cardBrand = detectCardBrand(cardNumber);

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-zinc-200 p-6 space-y-4",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <h5 className="!mb-0">Dados do cartão</h5>
        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <Lock className="h-3.5 w-3.5" />
          <span>Pagamento seguro</span>
        </div>
      </div>
      <Separator className="!bg-zinc-200/30" />

      {/* Erro de tokenização */}
      {tokenError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{tokenError}</span>
        </div>
      )}

      {/* Campo de número do cartão */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700">
          Número do cartão <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <InputCustom
            name="cardNumber"
            value={cardNumber}
            onChange={(e) => {
              setCardNumber(formatCardNumber(e.target.value));
              clearFieldError("cardNumber");
            }}
            placeholder="0000 0000 0000 0000"
            maxLength={19}
            size="md"
            disabled={disabled || isTokenizing}
            error={fieldErrors.cardNumber}
            className="pr-14"
          />
          {/* Ícone da bandeira do cartão - alinhado verticalmente ao centro do input */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
            <CardBrandIcon brand={cardBrand} className="w-10 h-6" />
          </div>
        </div>
      </div>

      {/* Validade e CVV */}
      <div className="grid grid-cols-2 gap-4">
        <InputCustom
          label="Validade"
          name="cardExpiry"
          value={cardExpiry}
          onChange={(e) => {
            setCardExpiry(formatExpiry(e.target.value));
            clearFieldError("cardExpiry");
          }}
          placeholder="MM/AA"
          maxLength={5}
          size="md"
          required
          disabled={disabled || isTokenizing}
          error={fieldErrors.cardExpiry}
        />
        <InputCustom
          label="CVV"
          name="cardCVV"
          value={cardCVV}
          onChange={(e) => {
            setCardCVV(formatCVV(e.target.value));
            clearFieldError("cardCVV");
          }}
          placeholder="123"
          maxLength={4}
          size="md"
          required
          disabled={disabled || isTokenizing}
          error={fieldErrors.cardCVV}
        />
      </div>

      {/* Nome no cartão */}
      <InputCustom
        label="Nome no cartão"
        name="cardHolder"
        value={cardHolder}
        onChange={(e) => {
          setCardHolder(e.target.value.toUpperCase());
          clearFieldError("cardHolder");
        }}
        placeholder="NOME COMO ESTÁ NO CARTÃO"
        size="md"
        required
        disabled={disabled || isTokenizing}
        error={fieldErrors.cardHolder}
      />

      {/* Info de segurança */}
      <p className="text-xs text-zinc-400 text-center">
        Seus dados são criptografados e processados de forma segura pelo Mercado
        Pago.
      </p>
    </div>
  );
};

export default CardFormTokenized;
