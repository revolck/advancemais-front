// src/theme/website/components/checkout/CheckoutView.tsx

"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Clock, CreditCard } from "lucide-react";
import { ButtonCustom } from "@/components/ui/custom/button";
import { toastCustom } from "@/components/ui/custom/toast";
import {
  validateCheckoutSession,
  validateSecurityToken,
  registerConfirmedPayment,
  type CheckoutSession,
} from "@/lib/checkout-session";
import {
  PENDING_COURSE_PURCHASE_KEY,
  PENDING_CURSOS_PAYMENT_KEY,
} from "@/lib/pending-storage-keys";
import { startCheckout } from "@/api/mercadopago";
import { iniciarCheckoutCurso, iniciarCheckoutRecuperacao } from "@/api/cursos";
import type { CheckoutRecuperacaoPayload } from "@/api/cursos/types";
import type { CheckoutIntent, MetodoPagamento } from "@/api/mercadopago/types";
import { validateCupom } from "@/api/cupons";
import {
  formatPrice,
  sanitizeDocument,
  getDocumentType,
  validateDocument,
} from "./utils/formatters";
import type { CheckoutViewProps, PaymentMethod, AppliedCoupon } from "./types";
import {
  CheckoutSkeleton,
  ExpirationWarningModal,
  TermsModal,
  PixSuccessScreen,
  BoletoSuccessScreen,
  PaymentMethodSelector,
  CardFormTokenized,
  PayerDataForm,
  PaymentMethodInfo,
  OrderSummary,
  CouponSection,
  SecurityBadges,
  ConsentCheckbox,
  CheckoutHeader,
  DocumentValidationModal,
  type DocumentValidationResult,
} from "./components";
import { useCheckoutData } from "./hooks";

/**
 * Verifica se estamos em ambiente com HTTPS real (não localhost)
 * A tokenização de cartão do Mercado Pago só funciona em HTTPS real (exigência PCI-DSS)
 *
 * IMPORTANTE: window.isSecureContext retorna true para localhost, mas o SDK do
 * Mercado Pago não aceita - ele exige HTTPS real para processar dados de cartão.
 */
const useIsRealHttps = () => {
  const [isHttps, setIsHttps] = useState<boolean | null>(null);

  useEffect(() => {
    // Verifica APENAS se está em HTTPS real (não localhost)
    // O SDK do Mercado Pago NÃO aceita localhost mesmo que seja "secure context"
    const isRealHttps =
      typeof window !== "undefined" && window.location.protocol === "https:";

    setIsHttps(isRealHttps);
  }, []);

  return isHttps;
};

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return cookie?.split("=")[1] || null;
}

function getCourseCheckoutErrorMessage(error: any): string {
  const code = error?.details?.code || error?.code;
  const fallback =
    error?.message || "Não foi possível iniciar o pagamento. Tente novamente.";

  const messages: Record<string, string> = {
    MERCADOPAGO_NOT_CONFIGURED:
      "Pagamento indisponível no momento. Tente novamente mais tarde.",
    PIX_KEY_NOT_CONFIGURED:
      "Pagamento via PIX indisponível no momento. Tente outro método de pagamento.",
    FINANCIAL_IDENTITY_ERROR:
      "O Mercado Pago não autorizou a criação deste pagamento. Verifique os dados e tente novamente.",
    INVALID_IDENTIFICATION: "CPF ou CNPJ inválido para este pagamento.",
    MERCADOPAGO_ERROR:
      "Não foi possível processar o pagamento no momento. Tente novamente.",
  };

  return typeof code === "string" && messages[code] ? messages[code] : fallback;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  sessionId,
  securityToken,
  className,
}) => {
  const router = useRouter();
  const pathname = usePathname() || "";

  const checkoutRootPath = useMemo(() => {
    const isDashboardPath =
      pathname === "/dashboard" || pathname.startsWith("/dashboard/");
    return isDashboardPath ? "/dashboard/checkout" : "/checkout";
  }, [pathname]);

  const checkoutResultPaths = useMemo(() => {
    return {
      success: `${checkoutRootPath}/sucesso`,
      failure: `${checkoutRootPath}/falha`,
      pending: `${checkoutRootPath}/pendente`,
      courseSuccess: `${checkoutRootPath}/curso/sucesso`,
      courseFailure: `${checkoutRootPath}/curso/falha`,
      coursePending: `${checkoutRootPath}/curso/pendente`,
    };
  }, [checkoutRootPath]);

  const currentPathWithQuery = useMemo(() => {
    if (typeof window === "undefined") return checkoutRootPath;
    return `${window.location.pathname}${window.location.search}`;
  }, [checkoutRootPath]);

  // Dados do checkout
  const {
    userId,
    payerEmail,
    setPayerEmail,
    payerDocument,
    setPayerDocument,
    documentType,
    setDocumentType,
    cardHolder,
    setCardHolder,
    payerAddress,
    setPayerAddress,
    isLoading: isDataLoading,
  } = useCheckoutData();

  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800);

  // Método de pagamento selecionado
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("credit");

  // Detecta se está em HTTPS real (não localhost) para tokenização
  const isRealHttps = useIsRealHttps();

  // Token do cartão (usado apenas em HTTPS real)
  const [cardToken, setCardToken] = useState<string | null>(null);
  const [cardLastFour, setCardLastFour] = useState<string | null>(null);
  const [cardBrand, setCardBrand] = useState<string | null>(null);

  // Ref para tokenização do cartão (chamada quando clica em Pagar)
  const cardTokenizeRef = React.useRef<
    | (() => Promise<{
        success: boolean;
        token?: string;
        lastFourDigits?: string;
        cardBrand?: string;
        error?: string;
      }>)
    | null
  >(null);

  // Determina se pode usar tokenização direta (apenas HTTPS real)
  // Em localhost (HTTP), SEMPRE usa redirect para Mercado Pago
  const canUseDirectTokenization = useMemo(() => {
    return isRealHttps === true;
  }, [isRealHttps]);

  // PIX
  const [pixCode, setPixCode] = useState<string | null>(null);
  const [pixQrCode, setPixQrCode] = useState<string | null>(null);
  const [pixExpiresAt, setPixExpiresAt] = useState<string | null>(null);

  // Boleto
  const [boletoUrl, setBoletoUrl] = useState<string | null>(null);
  const [boletoCode, setBoletoCode] = useState<string | null>(null);
  const [boletoExpiresAt, setBoletoExpiresAt] = useState<string | null>(null);

  // Checkout ID para polling
  const [checkoutId, setCheckoutId] = useState<string | null>(null);

  // Cupom
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(
    null,
  );
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [showCouponInput, setShowCouponInput] = useState(false);

  // Modal de aviso de expiração
  const [showExpirationWarning, setShowExpirationWarning] = useState(false);
  const [hasShownWarning, setHasShownWarning] = useState(false);
  const [hasExpired, setHasExpired] = useState(false);

  // Modal de termos
  const [showTermsModal, setShowTermsModal] = useState(false);
  type TermsConsentStatus = "none" | "pending" | "accepted";
  const [termsStatus, setTermsStatus] = useState<TermsConsentStatus>("none");
  const hasAcceptedTerms = termsStatus === "accepted";

  // Modal de validação de documento (CPF/CNPJ)
  const [showDocumentErrorModal, setShowDocumentErrorModal] = useState(false);
  const [documentErrorDetails, setDocumentErrorDetails] =
    useState<DocumentValidationResult | null>(null);

  // Valida sessão
  useEffect(() => {
    if (securityToken && !validateSecurityToken(sessionId, securityToken)) {
      setSessionError("Acesso negado");
      setIsValidating(false);
      return;
    }

    const {
      valid,
      session: validSession,
      error,
    } = validateCheckoutSession(sessionId);

    if (!valid || !validSession) {
      setSessionError(error || "Sessão expirada");
      setIsValidating(false);
      return;
    }

    setSession(validSession);
    setIsValidating(false);
  }, [sessionId, securityToken]);

  // Timer
  useEffect(() => {
    if (!session) return;

    const updateTimer = () => {
      const remaining = Math.max(
        0,
        Math.floor((session.expiresAt - Date.now()) / 1000),
      );
      setTimeLeft(remaining);

      // Mostra aviso quando faltar 1 minuto (60 segundos)
      if (remaining <= 60 && remaining > 0 && !hasShownWarning) {
        setShowExpirationWarning(true);
        setHasShownWarning(true);
      }

      // Quando expirar, mostra toast e redireciona (apenas uma vez)
      if (remaining === 0 && !hasExpired) {
        setHasExpired(true);
        toastCustom.error({
          title: "Sessão de checkout encerrada",
          description:
            "Por questões de segurança, sua sessão de pagamento foi encerrada. Seus dados não foram salvos. Inicie uma nova compra para continuar.",
          duration: 6000,
        });
        setTimeout(() => {
          router.push(session.originUrl || "/recrutamento");
        }, 2000);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [session, router, hasShownWarning, hasExpired]);

  // Mapeia o método de pagamento do frontend para o backend
  const mapPaymentMethod = (method: PaymentMethod): MetodoPagamento => {
    switch (method) {
      case "credit":
      case "debit":
        return "card";
      case "pix":
        return "pix";
      case "boleto":
        return "boleto";
      default:
        return "pix";
    }
  };

  // Processa pagamento
  const handleSubmitPayment = async () => {
    if (!session) return;

    if (
      session.productType === "curso" ||
      session.productType === "curso_pagamento"
    )
      return;

    // Verifica se o usuário está autenticado
    if (!userId) {
      toastCustom.error({
        title: "Autenticação necessária",
        description: "Você precisa estar logado para finalizar a compra.",
      });
      router.push(
        `/auth/login?redirect=${encodeURIComponent(currentPathWithQuery)}`,
      );
      return;
    }

    // Validação do documento para PIX/Boleto (validação matemática completa)
    const isPixOrBoleto = paymentMethod === "pix" || paymentMethod === "boleto";
    if (isPixOrBoleto) {
      const validation = validateDocument(payerDocument);

      if (!validation.valid) {
        toastCustom.error({
          title: `${validation.type} inválido`,
          description:
            validation.message ||
            `Por favor, informe um ${validation.type} válido.`,
        });
        return;
      }
    }

    setIsProcessing(true);

    try {
      // Determina o método de operação baseado no tipo de pagamento
      // PIX e Boleto = pagamento único, Cartão = assinatura recorrente
      const isRecurring =
        paymentMethod === "credit" || paymentMethod === "debit";
      const metodo = isRecurring ? "assinatura" : "pagamento";

      // Monta o payload conforme a API do Mercado Pago
      const checkoutIntent: CheckoutIntent = {
        // ✅ OBRIGATÓRIOS
        usuarioId: userId,
        planosEmpresariaisId: session.productId,
        metodo: metodo,
        aceitouTermos: true, // ⚠️ OBRIGATÓRIO!

        // 🔐 ACEITE DE TERMOS (para auditoria)
        aceitouTermosUserAgent: navigator.userAgent,

        // URLs de retorno (inclui dados do plano para retry em caso de falha)
        successUrl: `${window.location.origin}${checkoutResultPaths.success}`,
        failureUrl: `${window.location.origin}${
          checkoutResultPaths.failure
        }?plan_id=${encodeURIComponent(
          session.productId,
        )}&plan_name=${encodeURIComponent(session.productName)}&plan_price=${
          session.productPrice
        }`,
        pendingUrl: `${window.location.origin}${checkoutResultPaths.pending}`,
      };

      // Para pagamento único (PIX/Boleto), informar o tipo de pagamento e dados do pagador
      if (metodo === "pagamento") {
        checkoutIntent.pagamento = mapPaymentMethod(paymentMethod);

        // ✅ OBRIGATÓRIO para PIX/Boleto: dados do pagador com CPF/CNPJ
        const cleanDocument = sanitizeDocument(payerDocument);
        checkoutIntent.payer = {
          email: payerEmail,
          identification: {
            type: getDocumentType(payerDocument),
            number: cleanDocument,
          },
          // Nome opcional (separa primeiro nome e sobrenome)
          first_name: cardHolder.split(" ")[0] || undefined,
          last_name: cardHolder.split(" ").slice(1).join(" ") || undefined,
        };

        // ✅ OBRIGATÓRIO para BOLETO: endereço completo
        if (paymentMethod === "boleto" && payerAddress) {
          checkoutIntent.payer.address = {
            zip_code: payerAddress.zipCode.replace(/\D/g, ""),
            street_name: payerAddress.streetName,
            street_number: payerAddress.streetNumber,
            neighborhood: payerAddress.neighborhood,
            city: payerAddress.city,
            federal_unit: payerAddress.federalUnit,
          };
        }
      }

      // Para assinatura/pagamento com cartão
      if (isRecurring) {
        checkoutIntent.pagamento = "card";

        // Dados do pagador para identificação
        const cleanDocument = sanitizeDocument(payerDocument);
        checkoutIntent.payer = {
          email: payerEmail,
          identification: {
            type: getDocumentType(payerDocument),
            number: cleanDocument,
          },
          first_name: cardHolder.split(" ")[0] || undefined,
          last_name: cardHolder.split(" ").slice(1).join(" ") || undefined,
        };

        // Em HTTPS, faz tokenização no momento do pagamento
        if (canUseDirectTokenization) {
          // Se ainda não tem token, tenta tokenizar agora
          let tokenToUse = cardToken;

          if (!tokenToUse && cardTokenizeRef.current) {
            const tokenResult = await cardTokenizeRef.current();

            if (!tokenResult.success || !tokenResult.token) {
              // Tokenização falhou - erros já exibidos pelo componente
              setIsProcessing(false);
              return;
            }

            // Usa o token retornado diretamente
            tokenToUse = tokenResult.token;

            // Atualiza state para manter consistência
            setCardToken(tokenResult.token);
            setCardLastFour(tokenResult.lastFourDigits || null);
            setCardBrand(tokenResult.cardBrand || null);
          }

          // Envia para processamento direto com o token
          if (tokenToUse) {
            checkoutIntent.card = {
              token: tokenToUse,
              installments: 1,
            };
          } else {
            // Não conseguiu obter token
            toastCustom.error({
              title: "Erro no cartão",
              description:
                "Não foi possível processar os dados do cartão. Verifique as informações.",
            });
            setIsProcessing(false);
            return;
          }
        }
        // Se não estamos em HTTPS (desenvolvimento), vai usar redirect do Mercado Pago
        // Não precisa de token local - o backend gerencia isso
      }

      // Adiciona cupom se houver
      if (appliedCoupon) {
        checkoutIntent.cupomCodigo = appliedCoupon.code;
      }

      const result = await startCheckout(checkoutIntent);

      // Verifica se houve erro na resposta
      if (!result || !result.success) {
        // Trata erros específicos de CPF/CNPJ da API
        if (result?.code === "INVALID_CPF") {
          toastCustom.error({
            title: "CPF inválido",
            description:
              "O CPF informado não passou na validação. Verifique se digitou corretamente.",
          });
          setIsProcessing(false);
          return;
        }

        if (result?.code === "INVALID_CNPJ") {
          toastCustom.error({
            title: "CNPJ inválido",
            description:
              "O CNPJ informado não passou na validação. Verifique se digitou corretamente.",
          });
          setIsProcessing(false);
          return;
        }

        if (result?.code === "FINANCIAL_IDENTITY_ERROR") {
          toastCustom.error({
            title: "Documento não aceito",
            description:
              "O CPF/CNPJ informado não foi aceito pelo Mercado Pago. Certifique-se de usar um documento válido.",
          });
          setIsProcessing(false);
          return;
        }

        if (result?.code === "PAYER_IDENTIFICATION_REQUIRED") {
          toastCustom.error({
            title: "Documento obrigatório",
            description:
              "Por favor, informe um CPF ou CNPJ válido para prosseguir.",
          });
          setIsProcessing(false);
          return;
        }

        if (result?.code === "BOLETO_ADDRESS_REQUIRED") {
          toastCustom.error({
            title: "Endereço obrigatório",
            description:
              "Por favor, preencha todos os campos de endereço: CEP, logradouro, número, bairro, cidade e estado.",
          });
          setIsProcessing(false);
          return;
        }

        // Trata erros de validação genéricos
        if (result?.issues) {
          const issueMessages = Object.values(result.issues).flat().join(". ");
          throw new Error(
            issueMessages || result?.message || "Erro de validação",
          );
        }
        throw new Error(
          result?.message ||
            result?.error ||
            "Erro ao processar pagamento. Tente novamente.",
        );
      }

      // Salva o checkoutId para polling
      if (result.checkoutId) {
        setCheckoutId(result.checkoutId);
      }

      // Trata resultado por método de pagamento (nova estrutura da API)
      // PIX
      if (result.pagamento?.tipo === "pix" && result.pagamento?.qrCode) {
        setPixCode(result.pagamento.qrCode);
        setPixQrCode(result.pagamento.qrCodeBase64 || null);
        setPixExpiresAt(result.pagamento.expiresAt || null);
      }
      // Boleto
      else if (
        result.pagamento?.tipo === "boleto" &&
        result.pagamento?.boletoUrl
      ) {
        setBoletoUrl(result.pagamento.boletoUrl);
        setBoletoCode(result.pagamento.barcode || result.pagamento.boletoUrl);
        setBoletoExpiresAt(result.pagamento.expiresAt || null);
      }
      // Assinatura com redirect para Mercado Pago
      else if (
        result.assinatura?.requiresRedirect &&
        result.assinatura?.initPoint
      ) {
        window.location.href = result.assinatura.initPoint;
      }
      // Fallback para estrutura legada
      else if (result.qrCode) {
        setPixCode(result.qrCode);
        setPixQrCode(result.qrCodeBase64 || null);
      } else if (result.link) {
        window.location.href = result.link;
      }
      // Status do pagamento
      else if (
        result.pagamento?.status === "approved" ||
        result.status === "approved"
      ) {
        // Registra o pagamento para permitir acesso à página de sucesso
        const paymentId =
          result.pagamento?.paymentId || result.paymentId || "internal";
        registerConfirmedPayment(
          String(paymentId),
          "approved",
          session?.sessionId,
          session?.productName,
        );
        router.push(
          `${checkoutResultPaths.success}${
            paymentId !== "internal" ? `?payment_id=${paymentId}` : ""
          }`,
        );
      } else if (
        result.pagamento?.status === "pending" ||
        result.status === "pending"
      ) {
        // Registra o pagamento para permitir acesso à página de pendente
        const paymentId =
          result.pagamento?.paymentId || result.paymentId || "internal";
        registerConfirmedPayment(
          String(paymentId),
          "pending",
          session?.sessionId,
          session?.productName,
        );
        router.push(
          `${checkoutResultPaths.pending}${
            paymentId !== "internal" ? `?payment_id=${paymentId}` : ""
          }`,
        );
      } else if (
        result.pagamento?.status === "rejected" ||
        result.status === "rejected"
      ) {
        toastCustom.error({
          title: "Pagamento recusado",
          description:
            "O pagamento foi recusado. Por favor, tente outro método de pagamento.",
        });
      }
      // Assinatura autorizada
      else if (result.assinatura?.status === "authorized") {
        // Registra a assinatura para permitir acesso à página de sucesso
        const subscriptionId =
          result.assinatura?.preapprovalId || "subscription";
        registerConfirmedPayment(
          String(subscriptionId),
          "approved",
          session?.sessionId,
          session?.productName,
        );
        router.push(
          `${checkoutResultPaths.success}${
            subscriptionId !== "subscription"
              ? `?payment_id=${subscriptionId}`
              : ""
          }`,
        );
      }
    } catch (error) {
      console.error("Payment error:", error);

      // Trata diferentes tipos de erro
      let errorTitle = "Erro no pagamento";
      let errorMessage = "Erro ao processar pagamento. Tente novamente.";

      if (error instanceof Error) {
        // Verifica se é erro de JSON inválido (geralmente 404 ou 500)
        if (
          error.message.includes("Unexpected token") ||
          error.message.includes("not valid JSON")
        ) {
          errorTitle = "Serviço indisponível";
          errorMessage =
            "Serviço de pagamento temporariamente indisponível. Tente novamente em alguns minutos.";
        } else if (
          error.message.includes("401") ||
          error.message.includes("Unauthorized")
        ) {
          toastCustom.warning({
            title: "Sessão expirada",
            description: "Você será redirecionado para fazer login novamente.",
          });
          router.push(
            `/auth/login?redirect=${encodeURIComponent(currentPathWithQuery)}`,
          );
          return;
        } else if (
          error.message.includes("403") ||
          error.message.includes("Forbidden")
        ) {
          errorTitle = "Acesso negado";
          errorMessage = "Você não tem permissão para realizar esta operação.";
        } else {
          errorMessage = error.message;
        }
      }

      toastCustom.error({
        title: errorTitle,
        description: errorMessage,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponError("");

    try {
      const code = couponCode.toUpperCase();
      const productPrice = session?.productPrice || 0;

      // Chama a API de validação de cupom
      const response = await validateCupom({
        codigo: code,
        planosEmpresariaisId: session?.productId,
      });

      // Verifica se a validação falhou
      if (!response.success) {
        // Mapeia os códigos de erro para mensagens amigáveis
        const errorMessages: Record<string, string> = {
          CUPOM_NAO_ENCONTRADO: "Cupom inválido ou não encontrado",
          CUPOM_INATIVO: "Este cupom não está mais ativo",
          CUPOM_AINDA_NAO_VALIDO: "Este cupom ainda não está disponível",
          CUPOM_EXPIRADO: "Este cupom expirou",
          CUPOM_ESGOTADO: "Este cupom atingiu o limite de uso",
          CUPOM_NAO_APLICAVEL: "Este cupom não é válido para planos",
          CUPOM_NAO_APLICAVEL_PLANO: "Este cupom não é válido para este plano",
          CUPOM_APENAS_PRIMEIRA_COMPRA:
            "Este cupom é válido apenas para a primeira compra",
        };

        setCouponError(
          errorMessages[response.code] || response.message || "Cupom inválido",
        );
        setCouponLoading(false);
        return;
      }

      // Cupom válido - calcular desconto
      const cupom = response.cupom;
      let discount = 0;
      const discountType: "percentage" | "fixed" =
        cupom.tipoDesconto === "PORCENTAGEM" ? "percentage" : "fixed";

      if (cupom.tipoDesconto === "PORCENTAGEM" && cupom.valorPercentual) {
        discount = (productPrice * cupom.valorPercentual) / 100;
      } else if (cupom.tipoDesconto === "VALOR_FIXO" && cupom.valorFixo) {
        discount = cupom.valorFixo;
        // Desconto não pode ser maior que o preço
        if (discount > productPrice) {
          discount = productPrice;
        }
      }

      setAppliedCoupon({
        code: cupom.codigo,
        discount,
        discountType,
        discountValue: cupom.valorPercentual || cupom.valorFixo || 0,
      });
      setCouponCode("");
      setShowCouponInput(false);
    } catch (error) {
      console.error("Erro ao validar cupom:", error);
      setCouponError("Erro ao validar cupom. Tente novamente.");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleBack = useCallback(() => {
    router.push(session?.originUrl || "/recrutamento");
  }, [router, session]);

  const openTermsModal = useCallback(() => {
    setTermsStatus("pending");
    setShowTermsModal(true);
  }, []);

  const handleAcceptTerms = useCallback(() => {
    setTermsStatus("accepted");
    setShowTermsModal(false);
  }, []);

  const handleCloseTermsModal = useCallback(() => {
    setShowTermsModal(false);
    setTermsStatus("none");
  }, []);

  // Callbacks para validação de documento (CPF/CNPJ)
  const handleDocumentValidationError = useCallback(
    (result: DocumentValidationResult) => {
      setDocumentErrorDetails(result);
      setShowDocumentErrorModal(true);
    },
    [],
  );

  const handleDocumentValidationSuccess = useCallback(() => {
    // Limpa qualquer erro anterior
    setDocumentErrorDetails(null);
  }, []);

  const handleCloseDocumentErrorModal = useCallback(() => {
    setShowDocumentErrorModal(false);
  }, []);

  // Callback para quando o pagamento for confirmado
  const handlePaymentConfirmed = useCallback(() => {
    // Registra o pagamento para permitir acesso à página de sucesso
    registerConfirmedPayment(
      "manual-confirmation",
      "approved",
      session?.sessionId,
      session?.productName,
    );
    router.push(checkoutResultPaths.success);
  }, [
    router,
    session?.sessionId,
    session?.productName,
    checkoutResultPaths.success,
  ]);

  // Callback para ir para a página inicial
  const handleGoHome = useCallback(() => {
    router.push("/");
  }, [router]);

  // Callback para voltar e limpar o PIX/Boleto (gerar novo)
  const handleBackFromPayment = useCallback(() => {
    setPixCode(null);
    setPixQrCode(null);
    setPixExpiresAt(null);
    setBoletoUrl(null);
    setBoletoCode(null);
    setBoletoExpiresAt(null);
    setCheckoutId(null);
  }, []);

  // Limpa o token quando mudar o método de pagamento
  useEffect(() => {
    setCardToken(null);
    setCardLastFour(null);
    setCardBrand(null);
  }, [paymentMethod]);

  // Validação do formulário
  const isFormValid = () => {
    if (!payerEmail || !payerDocument) return false;

    // Para cartão: a tokenização acontece no momento do clique em "Pagar"
    // Não precisamos validar o token aqui, apenas garantir que os dados
    // do pagador estão preenchidos

    // Validação de endereço para boleto
    if (paymentMethod === "boleto") {
      const hasAddress =
        payerAddress.zipCode.replace(/\D/g, "").length === 8 &&
        payerAddress.streetName.trim().length > 0 &&
        payerAddress.streetNumber.trim().length > 0 &&
        payerAddress.neighborhood.trim().length > 0 &&
        payerAddress.city.trim().length > 0 &&
        payerAddress.federalUnit.trim().length === 2;

      if (!hasAddress) return false;
    }

    return true;
  };

  const courseMetadata = useMemo(() => {
    if (!session || session.productType !== "curso") return null;

    const raw = (session.metadata || {}) as Record<string, unknown>;
    const cursoId = typeof raw.cursoId === "string" ? raw.cursoId : null;
    const cursoNome = typeof raw.cursoNome === "string" ? raw.cursoNome : null;
    const turmaIdRaw = typeof raw.turmaId === "string" ? raw.turmaId : null;
    const turmaNome = typeof raw.turmaNome === "string" ? raw.turmaNome : null;
    const dataInicio =
      typeof raw.dataInicio === "string" ? raw.dataInicio : null;
    const dataFim = typeof raw.dataFim === "string" ? raw.dataFim : null;
    const maxInstallments =
      typeof raw.maxInstallments === "number" && raw.maxInstallments > 0
        ? raw.maxInstallments
        : 12;

    return {
      cursoId,
      cursoNome,
      turmaId: turmaIdRaw ?? session.productId,
      turmaNome,
      dataInicio,
      dataFim,
      maxInstallments,
    };
  }, [session]);

  const courseCheckoutStartedRef = React.useRef(false);

  const startCoursePurchaseCheckout = useCallback(async () => {
    if (!session || session.productType !== "curso") return;
    if (courseCheckoutStartedRef.current) return;

    const token = getCookieValue("token");
    if (!token) {
      const redirect = `${window.location.pathname}${window.location.search}`;
      router.push(`/auth/login?redirect=${encodeURIComponent(redirect)}`);
      return;
    }

    // Aguarda carregar o perfil antes de concluir que o usuário não está autenticado.
    // Sem isso, o usuário pode ser redirecionado para login mesmo já estando logado.
    if (isDataLoading) return;

    if (!userId) {
      const redirect = `${window.location.pathname}${window.location.search}`;
      router.push(`/auth/login?redirect=${encodeURIComponent(redirect)}`);
      return;
    }

    if (!courseMetadata?.cursoId || !courseMetadata?.turmaId) {
      toastCustom.error({
        title: "Sessão inválida",
        description: "Não foi possível identificar o curso/turma desta compra.",
      });
      router.push(session.originUrl || "/cursos");
      return;
    }

    if (!session.productPrice || session.productPrice <= 0) {
      toastCustom.error({
        title: "Turma gratuita",
        description:
          "Esta turma não exige pagamento. Volte para se matricular.",
      });
      router.push(
        session.originUrl ||
          `/cursos/${encodeURIComponent(courseMetadata.cursoId)}#turmas`,
      );
      return;
    }

    if (!hasAcceptedTerms) {
      toastCustom.warning({
        title: "Aceite necessário",
        description: "Aceite os termos para prosseguir com a matrícula.",
      });
      return;
    }

    const pagamento = mapPaymentMethod(paymentMethod);
    if (pagamento === "card" && !canUseDirectTokenization) {
      toastCustom.warning({
        title: "Cartão indisponível neste ambiente",
        description:
          "Em ambiente local, utilize PIX ou boleto para testar a matrícula.",
      });
      return;
    }

    courseCheckoutStartedRef.current = true;
    setIsProcessing(true);

    try {
      const turmaNome = courseMetadata.turmaNome || "Turma";
      const payer: NonNullable<CheckoutRecuperacaoPayload["payer"]> = {
        email: payerEmail,
        identification: {
          type: getDocumentType(payerDocument),
          number: sanitizeDocument(payerDocument),
        },
        ...(paymentMethod === "boleto"
          ? {
              address: {
                zip_code: payerAddress.zipCode.replace(/\D/g, ""),
                street_name: payerAddress.streetName,
                street_number: payerAddress.streetNumber,
                neighborhood: payerAddress.neighborhood,
                city: payerAddress.city,
                federal_unit: payerAddress.federalUnit,
              },
            }
          : {}),
      };

      let card: { token: string; installments?: number } | undefined;
      if (pagamento === "card") {
        let tokenToUse = cardToken;
        if (!tokenToUse && cardTokenizeRef.current) {
          const tokenResult = await cardTokenizeRef.current();
          if (!tokenResult.success || !tokenResult.token) {
            courseCheckoutStartedRef.current = false;
            setIsProcessing(false);
            return;
          }
          tokenToUse = tokenResult.token;
          setCardToken(tokenResult.token);
          setCardLastFour(tokenResult.lastFourDigits || null);
          setCardBrand(tokenResult.cardBrand || null);
        }
        if (!tokenToUse)
          throw new Error("Não foi possível tokenizar o cartão.");
        card = { token: tokenToUse, installments: 1 };
      }

      localStorage.setItem(
        PENDING_COURSE_PURCHASE_KEY,
        JSON.stringify({
          cursoId: courseMetadata.cursoId,
          cursoNome: courseMetadata.cursoNome || "Curso",
          turmaId: courseMetadata.turmaId,
          turmaNome,
          valor: session.productPrice,
          createdAt: Date.now(),
        }),
      );

      const response = await iniciarCheckoutCurso({
        cursoId: courseMetadata.cursoId,
        turmaId: courseMetadata.turmaId,
        pagamento,
        payer,
        ...(card ? { card } : {}),
        ...(appliedCoupon?.code ? { cupomCodigo: appliedCoupon.code } : {}),
        aceitouTermos: true,
        aceitouTermosUserAgent: navigator.userAgent,
      });
      const result = response.pagamento;
      if (result?.tipo === "pix" && result.qrCode) {
        setPixCode(result.qrCode);
        setPixQrCode(result.qrCodeBase64 || null);
        setPixExpiresAt(result.expiresAt || null);
        setCheckoutId(result.paymentId);
      } else if (result?.tipo === "boleto" && result.boletoUrl) {
        setBoletoUrl(result.boletoUrl);
        setBoletoCode(result.barcode || result.boletoUrl);
        setBoletoExpiresAt(result.expiresAt || null);
        setCheckoutId(result.paymentId);
      } else if (result?.status === "approved") {
        router.push(
          `${checkoutResultPaths.courseSuccess}${
            result.paymentId
              ? `?payment_id=${encodeURIComponent(result.paymentId)}`
              : ""
          }`,
        );
      } else {
        router.push(
          `${checkoutResultPaths.coursePending}${
            result?.paymentId
              ? `?payment_id=${encodeURIComponent(result.paymentId)}`
              : ""
          }`,
        );
      }
    } catch (error: any) {
      const message = getCourseCheckoutErrorMessage(error);
      toastCustom.error({
        title: "Erro ao iniciar pagamento",
        description: message,
      });
      courseCheckoutStartedRef.current = false;
      setIsProcessing(false);
    }
  }, [
    courseMetadata,
    appliedCoupon?.code,
    canUseDirectTokenization,
    cardToken,
    hasAcceptedTerms,
    isDataLoading,
    payerAddress,
    payerDocument,
    payerEmail,
    paymentMethod,
    router,
    session,
    userId,
    checkoutResultPaths.courseSuccess,
    checkoutResultPaths.coursePending,
  ]);

  const coursePaymentMetadata = useMemo(() => {
    if (!session || session.productType !== "curso_pagamento") return null;

    const raw = (session.metadata || {}) as Record<string, unknown>;
    const tipo = typeof raw.tipo === "string" ? raw.tipo : null;
    const titulo =
      typeof raw.titulo === "string" && raw.titulo.trim()
        ? raw.titulo.trim()
        : session.productName;
    const valor =
      typeof raw.valor === "number" && Number.isFinite(raw.valor)
        ? raw.valor
        : session.productPrice || 0;
    const cursoId = typeof raw.cursoId === "string" ? raw.cursoId : null;
    const cursoNome = typeof raw.cursoNome === "string" ? raw.cursoNome : null;
    const turmaId = typeof raw.turmaId === "string" ? raw.turmaId : null;
    const turmaNome = typeof raw.turmaNome === "string" ? raw.turmaNome : null;
    const pagamentoId =
      typeof raw.pagamentoId === "string" ? raw.pagamentoId : null;
    const provaId =
      typeof raw.provaId === "string" ? raw.provaId : session.productId;
    const provaTitulo =
      typeof raw.provaTitulo === "string" ? raw.provaTitulo : null;
    const maxInstallments =
      typeof raw.maxInstallments === "number" && raw.maxInstallments > 0
        ? raw.maxInstallments
        : 12;

    const returnTo =
      typeof raw.returnTo === "string" && raw.returnTo.trim()
        ? raw.returnTo
        : session.originUrl || "/dashboard/cursos/pagamentos";

    return {
      tipo,
      titulo,
      valor,
      cursoId,
      cursoNome,
      turmaId,
      turmaNome,
      pagamentoId,
      provaId,
      provaTitulo,
      maxInstallments,
      returnTo,
    };
  }, [session]);

  const startCoursePaymentCheckout = useCallback(async () => {
    if (!session || session.productType !== "curso_pagamento") return;
    if (courseCheckoutStartedRef.current) return;

    const token = getCookieValue("token");
    if (!token) {
      const redirect = `${window.location.pathname}${window.location.search}`;
      router.push(`/auth/login?redirect=${encodeURIComponent(redirect)}`);
      return;
    }

    if (isDataLoading) return;

    if (!userId) {
      const redirect = `${window.location.pathname}${window.location.search}`;
      router.push(`/auth/login?redirect=${encodeURIComponent(redirect)}`);
      return;
    }

    if (!coursePaymentMetadata?.pagamentoId || !coursePaymentMetadata.provaId) {
      toastCustom.error({
        title: "Sessão inválida",
        description: "Não foi possível identificar o pagamento desta cobrança.",
      });
      router.push(session.originUrl || "/dashboard/cursos/pagamentos");
      return;
    }

    if (!session.productPrice || session.productPrice <= 0) {
      toastCustom.error({
        title: "Pagamento inválido",
        description: "Não foi possível identificar o valor desta cobrança.",
      });
      router.push(session.originUrl || "/dashboard/cursos/pagamentos");
      return;
    }

    if (!payerEmail || !payerDocument) {
      toastCustom.error({
        title: "Dados obrigatórios",
        description: "Preencha e-mail e CPF/CNPJ para continuar.",
      });
      return;
    }

    if (paymentMethod === "boleto") {
      const hasAddress =
        payerAddress.zipCode.replace(/\D/g, "").length === 8 &&
        payerAddress.streetName.trim().length > 0 &&
        payerAddress.streetNumber.trim().length > 0 &&
        payerAddress.neighborhood.trim().length > 0 &&
        payerAddress.city.trim().length > 0 &&
        payerAddress.federalUnit.trim().length === 2;

      if (!hasAddress) {
        toastCustom.error({
          title: "Endereço obrigatório",
          description:
            "Preencha CEP, logradouro, número, bairro, cidade e UF para gerar o boleto.",
        });
        return;
      }
    }

    courseCheckoutStartedRef.current = true;
    setIsProcessing(true);

    try {
      const returnTo = coursePaymentMetadata.returnTo;
      const resultBasePath = "/dashboard/cursos/pagamentos";
      const returnToQuery = encodeURIComponent(returnTo);

      localStorage.setItem(
        PENDING_CURSOS_PAYMENT_KEY,
        JSON.stringify({
          tipo: coursePaymentMetadata.tipo ?? "recuperacao-final",
          titulo: coursePaymentMetadata.titulo,
          valor: session.productPrice,
          cursoId: coursePaymentMetadata.cursoId,
          turmaId: coursePaymentMetadata.turmaId,
          provaId: coursePaymentMetadata.provaId,
          returnTo,
          createdAt: Date.now(),
        }),
      );

      const payer: NonNullable<CheckoutRecuperacaoPayload["payer"]> = {
        email: payerEmail,
        identification: {
          type: getDocumentType(payerDocument),
          number: sanitizeDocument(payerDocument),
        },
      };

      if (paymentMethod === "boleto") {
        payer.address = {
          zip_code: payerAddress.zipCode.replace(/\D/g, ""),
          street_name: payerAddress.streetName,
          street_number: payerAddress.streetNumber,
          neighborhood: payerAddress.neighborhood,
          city: payerAddress.city,
          federal_unit: payerAddress.federalUnit,
        };
      }

      // Tokenização do cartão (apenas em HTTPS real).
      let cardPayload: { token: string; installments?: number } | undefined;
      if (
        (paymentMethod === "credit" || paymentMethod === "debit") &&
        canUseDirectTokenization
      ) {
        let tokenToUse = cardToken;
        if (!tokenToUse && cardTokenizeRef.current) {
          const tokenResult = await cardTokenizeRef.current();
          if (!tokenResult.success || !tokenResult.token) {
            setIsProcessing(false);
            courseCheckoutStartedRef.current = false;
            return;
          }
          tokenToUse = tokenResult.token;
          setCardToken(tokenResult.token);
          setCardLastFour(tokenResult.lastFourDigits || null);
          setCardBrand(tokenResult.cardBrand || null);
        }

        if (!tokenToUse) {
          toastCustom.error({
            title: "Erro no cartão",
            description:
              "Não foi possível processar os dados do cartão. Verifique as informações.",
          });
          setIsProcessing(false);
          courseCheckoutStartedRef.current = false;
          return;
        }

        cardPayload = { token: tokenToUse, installments: 1 };
      }

      if (
        (paymentMethod === "credit" || paymentMethod === "debit") &&
        !canUseDirectTokenization
      ) {
        throw new Error(
          "Em ambiente local, utilize PIX ou boleto para testar a recuperação.",
        );
      }

      const response = await iniciarCheckoutRecuperacao(
        coursePaymentMetadata.pagamentoId,
        {
          pagamento: mapPaymentMethod(paymentMethod),
          payer,
          ...(cardPayload ? { card: cardPayload } : {}),
        },
      );
      const result = response.pagamento;
      if (result.tipo === "pix" && result.qrCode) {
        setPixCode(result.qrCode);
        setPixQrCode(result.qrCodeBase64 || null);
        setPixExpiresAt(result.expiresAt || null);
        setCheckoutId(result.paymentId);
      } else if (result.tipo === "boleto" && result.boletoUrl) {
        setBoletoUrl(result.boletoUrl);
        setBoletoCode(result.barcode || result.boletoUrl);
        setBoletoExpiresAt(result.expiresAt || null);
        setCheckoutId(result.paymentId);
      } else if (result.statusPagamento === "APROVADO") {
        router.push(
          `${resultBasePath}/sucesso?returnTo=${returnToQuery}${
            result.paymentId
              ? `&payment_id=${encodeURIComponent(result.paymentId)}`
              : ""
          }`,
        );
      } else if (
        result.statusPagamento === "RECUSADO" ||
        result.statusPagamento === "CANCELADO"
      ) {
        router.push(`${resultBasePath}/falha?returnTo=${returnToQuery}`);
      } else {
        router.push(
          `${resultBasePath}/pendente?returnTo=${returnToQuery}${
            result.paymentId
              ? `&payment_id=${encodeURIComponent(result.paymentId)}`
              : ""
          }`,
        );
      }
    } catch (error: any) {
      const status = error?.status as number | undefined;
      const message =
        status === 404
          ? "Endpoint não encontrado. Confirme se o backend (API Mercado Pago) está rodando e atualizado."
          : getCourseCheckoutErrorMessage(error);
      toastCustom.error({
        title: "Erro ao iniciar pagamento",
        description: message,
      });
      courseCheckoutStartedRef.current = false;
      setIsProcessing(false);
    }
  }, [
    coursePaymentMetadata,
    canUseDirectTokenization,
    isDataLoading,
    payerAddress,
    payerDocument,
    payerEmail,
    paymentMethod,
    router,
    session,
    userId,
    cardToken,
  ]);

  // Loading
  if (isValidating || isDataLoading) {
    return <CheckoutSkeleton />;
  }

  // Erro de sessão
  if (sessionError || !session) {
    return (
      <div className="container w-full mx-auto py-24">
        <div className="bg-white rounded-2xl shadow-xl shadow-zinc-200/50 p-8 max-w-sm w-full text-center mx-auto">
          <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Clock className="w-8 h-8 text-zinc-400" />
          </div>
          <h1 className="text-xl font-semibold text-zinc-900 mb-2">
            Sessão expirada
          </h1>
          <p className="text-zinc-500 text-sm mb-6">
            Sua sessão de pagamento expirou por segurança.
          </p>
          <ButtonCustom variant="primary" fullWidth onClick={handleBack}>
            Voltar
          </ButtonCustom>
        </div>
      </div>
    );
  }

  const price = session.productPrice || 0;
  const discount = appliedCoupon?.discount || 0;
  const total = price - discount;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isLowTime = timeLeft < 300;
  const isCoursePayment = session.productType === "curso_pagamento";
  const isCoursePurchase = session.productType === "curso";
  const isCourseCheckout = isCoursePayment || isCoursePurchase;
  const isTermsRequired = !isCoursePayment;

  // Tela de PIX gerado
  if (pixCode && session) {
    return (
      <PixSuccessScreen
        pixCode={pixCode}
        pixQrCode={pixQrCode}
        productName={session.productName}
        productPrice={session.productPrice || 0}
        appliedCoupon={isCoursePayment ? null : appliedCoupon}
        sessionTimeLeft={timeLeft}
        checkoutId={checkoutId}
        onBack={handleBackFromPayment}
        onPaymentConfirmed={handlePaymentConfirmed}
      />
    );
  }

  // Tela de Boleto gerado
  if (boletoUrl && session) {
    return (
      <BoletoSuccessScreen
        boletoUrl={boletoUrl}
        boletoCode={boletoCode}
        productName={session.productName}
        productPrice={session.productPrice || 0}
        appliedCoupon={isCoursePayment ? null : appliedCoupon}
        sessionTimeLeft={timeLeft}
        checkoutId={checkoutId}
        onBack={handleBackFromPayment}
        onGoHome={handleGoHome}
      />
    );
  }

  return (
    <>
      <div className={cn("container w-full mx-auto py-8 lg:py-12", className)}>
        <CheckoutHeader
          minutes={minutes}
          seconds={seconds}
          isLowTime={isLowTime}
          onBack={handleBack}
          subtitle={
            isCourseCheckout ? "Complete sua compra com segurança" : undefined
          }
        />

        {/* Conteúdo principal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Coluna esquerda - Pagamento */}
          <div className="lg:col-span-7 space-y-6">
            {/* Métodos de pagamento */}
            <PaymentMethodSelector
              selected={paymentMethod}
              onChange={setPaymentMethod}
            />

            {/* Formulário de Cartão - depende do ambiente (HTTPS real ou HTTP/localhost) */}
            {(paymentMethod === "credit" || paymentMethod === "debit") && (
              <>
                {/* Ainda verificando se é HTTPS real */}
                {isRealHttps === null && (
                  <div className="bg-zinc-100 rounded-2xl p-6 animate-pulse">
                    <div className="h-4 w-48 bg-zinc-200 rounded mb-2"></div>
                    <div className="h-3 w-64 bg-zinc-200 rounded"></div>
                  </div>
                )}

                {/* HTTPS (Produção): Formulário de tokenização direta */}
                {canUseDirectTokenization && (
                  <CardFormTokenized
                    documentType={getDocumentType(payerDocument)}
                    documentNumber={payerDocument}
                    disabled={isProcessing}
                    tokenizeRef={cardTokenizeRef}
                    onTokenGenerated={(token, lastFour, brand) => {
                      setCardToken(token);
                      setCardLastFour(lastFour);
                      setCardBrand(brand);
                    }}
                    onError={(error) => {
                      setCardToken(null);
                      toastCustom.error({
                        title: "Erro no cartão",
                        description: error,
                      });
                    }}
                  />
                )}

                {/* HTTP/Localhost (Desenvolvimento): cartão via redirect (Checkout Pro) */}
                {isRealHttps === false && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <CreditCard className="w-6 h-6 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="!font-semibold !text-amber-800 !mb-0">
                          Ambiente de Desenvolvimento
                        </h4>
                        <p className="!text-sm !text-amber-700 !leading-relaxed">
                          Em ambiente local, o pagamento com cartão é finalizado
                          no Mercado Pago (redirect). Para pagamento direto no
                          site (tokenização), é necessário HTTPS real.
                        </p>
                      </div>
                    </div>

                    <div className="bg-amber-100/50 rounded-lg p-3 space-y-2">
                      <p className="!text-xs !font-medium !text-amber-800">
                        Para habilitar cartão direto no site:
                      </p>
                      <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
                        <li>Faça deploy na Vercel (HTTPS)</li>
                        <li>
                          Ou use{" "}
                          <code className="bg-amber-200/50 px-1 rounded">
                            ngrok http 3001
                          </code>{" "}
                          para túnel HTTPS
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Info PIX ou Boleto */}
            <PaymentMethodInfo
              method={paymentMethod}
              showCardInfo={isCourseCheckout}
            />

            {/* Dados do pagador */}
            <PayerDataForm
              payerEmail={payerEmail}
              payerDocument={payerDocument}
              documentType={documentType}
              paymentMethod={paymentMethod}
              address={payerAddress}
              onPayerEmailChange={setPayerEmail}
              onPayerDocumentChange={setPayerDocument}
              onDocumentTypeChange={setDocumentType}
              onAddressChange={setPayerAddress}
              onDocumentValidationError={handleDocumentValidationError}
              onDocumentValidationSuccess={handleDocumentValidationSuccess}
            />

            {/* Botão de pagamento */}
            <ButtonCustom
              variant="primary"
              size="lg"
              fullWidth
              onClick={
                isCoursePayment
                  ? startCoursePaymentCheckout
                  : isCoursePurchase
                    ? startCoursePurchaseCheckout
                    : handleSubmitPayment
              }
              isLoading={isProcessing}
              disabled={
                !isFormValid() ||
                isProcessing ||
                (isTermsRequired && !hasAcceptedTerms)
              }
            >
              {isCourseCheckout
                ? "Continuar para pagamento"
                : paymentMethod === "pix"
                  ? "Gerar QR Code PIX"
                  : paymentMethod === "boleto"
                    ? "Gerar Boleto"
                    : canUseDirectTokenization
                      ? `Pagar ${formatPrice(total)}`
                      : "Continuar para pagamento"}
            </ButtonCustom>

            {/* Checkbox de consentimento */}
            {isTermsRequired ? (
              <ConsentCheckbox
                checked={hasAcceptedTerms}
                onOpenTerms={openTermsModal}
                variant={isCourseCheckout ? "course" : "subscription"}
                onCheckedChange={(checked) => {
                  if (!checked) {
                    setTermsStatus("none");
                  }
                }}
              />
            ) : null}
          </div>

          {/* Coluna direita - Resumo */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Resumo do pedido */}
              <OrderSummary
                productName={session.productName}
                price={price}
                appliedCoupon={isCoursePayment ? null : appliedCoupon}
                itemLabel={
                  isCoursePayment
                    ? coursePaymentMetadata?.titulo || session.productName
                    : isCoursePurchase
                      ? session.productName
                      : undefined
                }
                totalSuffix={isCourseCheckout ? null : undefined}
              />

              {/* Cupom de desconto */}
              {!isCoursePayment && (
                <CouponSection
                  appliedCoupon={appliedCoupon}
                  couponCode={couponCode}
                  couponError={couponError}
                  couponLoading={couponLoading}
                  showCouponInput={showCouponInput}
                  onCouponCodeChange={setCouponCode}
                  onApplyCoupon={handleApplyCoupon}
                  onRemoveCoupon={() => setAppliedCoupon(null)}
                  onToggleInput={() => setShowCouponInput(!showCouponInput)}
                  onCancelInput={() => {
                    setShowCouponInput(false);
                    setCouponCode("");
                    setCouponError("");
                  }}
                />
              )}

              {/* Segurança */}
              <SecurityBadges />
            </div>
          </div>
        </div>
      </div>

      {/* Modal de aviso de expiração */}
      <ExpirationWarningModal
        isOpen={showExpirationWarning}
        onClose={() => setShowExpirationWarning(false)}
        timeLeft={timeLeft}
      />

      {/* Modal de termos */}
      <TermsModal
        isOpen={showTermsModal}
        onClose={handleCloseTermsModal}
        onCancel={handleCloseTermsModal}
        onAccept={handleAcceptTerms}
        variant={isCourseCheckout ? "course" : "subscription"}
      />

      {/* Modal de erro de validação de documento (CPF/CNPJ) */}
      <DocumentValidationModal
        isOpen={showDocumentErrorModal}
        onClose={handleCloseDocumentErrorModal}
        documentType={documentErrorDetails?.type || "CPF"}
        documentValue={payerDocument}
      />
    </>
  );
};

export default CheckoutView;
