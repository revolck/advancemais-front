// src/theme/website/components/checkout/CheckoutView.tsx

"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Clock, CreditCard, Shield } from "lucide-react";
import { ButtonCustom } from "@/components/ui/custom/button";
import { toastCustom } from "@/components/ui/custom/toast";
import {
  validateCheckoutSession,
  validateSecurityToken,
  registerConfirmedPayment,
  type CheckoutSession,
} from "@/lib/checkout-session";
import { createSinglePayment, startCheckout } from "@/api/mercadopago";
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

const PENDING_COURSE_PURCHASE_KEY = "pending_course_purchase_v1";

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
    null
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
        Math.floor((session.expiresAt - Date.now()) / 1000)
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

    if (session.productType === "curso") return;

    // Verifica se o usuário está autenticado
    if (!userId) {
      toastCustom.error({
        title: "Autenticação necessária",
        description: "Você precisa estar logado para finalizar a compra.",
      });
      router.push(`/auth/login?redirect=${encodeURIComponent(currentPathWithQuery)}`);
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
          session.productId
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
            issueMessages || result?.message || "Erro de validação"
          );
        }
        throw new Error(
          result?.message ||
            result?.error ||
            "Erro ao processar pagamento. Tente novamente."
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
          session?.productName
        );
        router.push(
          `${checkoutResultPaths.success}${
            paymentId !== "internal" ? `?payment_id=${paymentId}` : ""
          }`
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
          session?.productName
        );
        router.push(
          `${checkoutResultPaths.pending}${
            paymentId !== "internal" ? `?payment_id=${paymentId}` : ""
          }`
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
          session?.productName
        );
        router.push(
          `${checkoutResultPaths.success}${
            subscriptionId !== "subscription"
              ? `?payment_id=${subscriptionId}`
              : ""
          }`
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
          router.push(`/auth/login?redirect=${encodeURIComponent(currentPathWithQuery)}`);
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
          errorMessages[response.code] || response.message || "Cupom inválido"
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
    []
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
      session?.productName
    );
    router.push(checkoutResultPaths.success);
  }, [router, session?.sessionId, session?.productName, checkoutResultPaths.success]);

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
    const dataInicio = typeof raw.dataInicio === "string" ? raw.dataInicio : null;
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

  const startCourseCheckout = useCallback(async () => {
    if (!session || session.productType !== "curso") return;

    const token = getCookieValue("token");
    if (!token) {
      const redirect = `${window.location.pathname}${window.location.search}`;
      router.push(`/auth/login?redirect=${encodeURIComponent(redirect)}`);
      return;
    }

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
        description: "Esta turma não exige pagamento. Volte para se matricular.",
      });
      router.push(session.originUrl || `/cursos/${encodeURIComponent(courseMetadata.cursoId)}#turmas`);
      return;
    }

    setIsProcessing(true);

    try {
      const turmaNome = courseMetadata.turmaNome || "Turma";

      localStorage.setItem(
        PENDING_COURSE_PURCHASE_KEY,
        JSON.stringify({
          cursoId: courseMetadata.cursoId,
          cursoNome: courseMetadata.cursoNome || "Curso",
          turmaId: courseMetadata.turmaId,
          turmaNome,
          valor: session.productPrice,
          createdAt: Date.now(),
        })
      );

      const baseUrl = window.location.origin;
      const externalReference = `curso:${courseMetadata.cursoId}:turma:${courseMetadata.turmaId}:session:${session.sessionId}:aluno:${userId}`;

      const response = await createSinglePayment(
        {
          usuarioId: userId,
          items: [
            {
              id: courseMetadata.turmaId,
              title: session.productName,
              description: "Matrícula em turma (pagamento único)",
              quantity: 1,
              unit_price: session.productPrice,
              currency_id: session.currency || "BRL",
            },
          ],
          installments: courseMetadata.maxInstallments,
          successUrl: `${baseUrl}${checkoutResultPaths.courseSuccess}`,
          failureUrl: `${baseUrl}${checkoutResultPaths.courseFailure}`,
          pendingUrl: `${baseUrl}${checkoutResultPaths.coursePending}`,
          externalReference,
          metadata: {
            checkoutSessionId: session.sessionId,
            cursoId: courseMetadata.cursoId,
            turmaId: courseMetadata.turmaId,
            turmaNome,
          },
        },
        token
      );

      if (!response?.initPoint) {
        throw new Error("Não foi possível iniciar o checkout.");
      }

      window.location.href = response.initPoint;
    } catch (error: any) {
      const message =
        error?.message || "Não foi possível iniciar o pagamento. Tente novamente.";
      toastCustom.error({ title: "Erro ao iniciar pagamento", description: message });
      setIsProcessing(false);
    }
  }, [courseMetadata, router, session, userId]);

  useEffect(() => {
    if (!session || session.productType !== "curso") return;
    if (courseCheckoutStartedRef.current) return;
    courseCheckoutStartedRef.current = true;
    startCourseCheckout();
  }, [session, startCourseCheckout]);

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

  if (session.productType === "curso") {
    const startLabel = courseMetadata?.dataInicio
      ? new Date(courseMetadata.dataInicio).toLocaleDateString("pt-BR")
      : null;
    const endLabel = courseMetadata?.dataFim
      ? new Date(courseMetadata.dataFim).toLocaleDateString("pt-BR")
      : null;
    const dateRange =
      startLabel && endLabel
        ? `${startLabel} — ${endLabel}`
        : startLabel
        ? `Início: ${startLabel}`
        : null;

    return (
      <div
        className={cn(
          "min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50",
          className
        )}
      >
        <div className="container mx-auto px-4 py-10">
          <div className="max-w-2xl mx-auto">
            <div className="rounded-3xl border border-zinc-100 bg-white shadow-xl shadow-zinc-200/40 overflow-hidden">
              <div className="px-6 sm:px-8 py-8 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 text-white">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-white/75">
                      Checkout seguro
                    </p>
                    <h1 className="mt-1 text-xl sm:text-2xl font-bold">
                      {courseMetadata?.cursoNome || session.productName}
                    </h1>
                    {courseMetadata?.turmaNome ? (
                      <p className="mt-1 text-sm text-white/85">
                        {courseMetadata.turmaNome}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                    <Shield className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <div className="px-6 sm:px-8 py-8 space-y-5">
                <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold uppercase text-zinc-500">
                        Total
                      </div>
                      <div className="mt-1 text-2xl font-bold text-zinc-900">
                        {formatPrice(session.productPrice || 0)}
                      </div>
                      {dateRange ? (
                        <div className="mt-2 text-sm text-zinc-600">
                          Período:{" "}
                          <span className="font-medium">{dateRange}</span>
                        </div>
                      ) : null}
                      <div className="mt-2 text-sm text-zinc-600">
                        Cartão de crédito em até{" "}
                        <span className="font-semibold">
                          {courseMetadata?.maxInstallments || 12}x sem juros
                        </span>
                        .
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-zinc-600">
                      <CreditCard className="h-4 w-4" />
                      Mercado Pago
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <ButtonCustom
                    variant="primary"
                    fullWidth
                    isLoading={isProcessing}
                    onClick={startCourseCheckout}
                  >
                    Continuar para pagamento
                  </ButtonCustom>
                  <ButtonCustom
                    variant="outline"
                    fullWidth
                    disabled={isProcessing}
                    onClick={handleBack}
                  >
                    Voltar
                  </ButtonCustom>
                  <p className="text-xs text-zinc-500 text-center">
                    Você será redirecionado para finalizar o pagamento com
                    segurança.
                  </p>
                </div>
              </div>
            </div>
          </div>
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

  // Tela de PIX gerado
  if (pixCode && session) {
    return (
      <PixSuccessScreen
        pixCode={pixCode}
        pixQrCode={pixQrCode}
        productName={session.productName}
        productPrice={session.productPrice || 0}
        appliedCoupon={appliedCoupon}
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
        appliedCoupon={appliedCoupon}
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

                {/* HTTP/Localhost (Desenvolvimento): Aviso de indisponibilidade */}
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
                          Pagamentos com cartão de crédito/débito não estão
                          disponíveis em ambiente local. O Mercado Pago exige
                          conexão HTTPS para processar dados de cartão.
                        </p>
                      </div>
                    </div>

                    <div className="bg-amber-100/50 rounded-lg p-3 space-y-2">
                      <p className="!text-xs !font-medium !text-amber-800">
                        Para testar pagamentos com cartão:
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

                    <div className="flex items-center gap-2 pt-2 border-t border-amber-200">
                      <Shield className="w-4 h-4 text-amber-600" />
                      <span className="text-xs text-amber-600">
                        PIX e Boleto funcionam normalmente em desenvolvimento
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Info PIX ou Boleto */}
            <PaymentMethodInfo method={paymentMethod} />

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
            {/* Em desenvolvimento + cartão = botão desabilitado */}
            {(paymentMethod === "credit" || paymentMethod === "debit") &&
            isRealHttps === false ? (
              <ButtonCustom
                variant="secondary"
                size="lg"
                fullWidth
                disabled={true}
              >
                Indisponível em Desenvolvimento
              </ButtonCustom>
            ) : (
              <ButtonCustom
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleSubmitPayment}
                isLoading={isProcessing}
                disabled={!isFormValid() || isProcessing || !hasAcceptedTerms}
              >
                {paymentMethod === "pix"
                  ? "Gerar QR Code PIX"
                  : paymentMethod === "boleto"
                  ? "Gerar Boleto"
                  : // HTTPS: Pagamento direto com cartão
                    `Pagar ${formatPrice(total)}`}
              </ButtonCustom>
            )}

            {/* Checkbox de consentimento */}
            <ConsentCheckbox
              checked={hasAcceptedTerms}
              onOpenTerms={openTermsModal}
              onCheckedChange={(checked) => {
                if (!checked) {
                  setTermsStatus("none");
                }
              }}
            />
          </div>

          {/* Coluna direita - Resumo */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Resumo do pedido */}
              <OrderSummary
                productName={session.productName}
                price={price}
                appliedCoupon={appliedCoupon}
              />

              {/* Cupom de desconto */}
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
