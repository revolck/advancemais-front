// src/app/website/checkout/falha/page.tsx

"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  XCircle,
  ArrowLeft,
  AlertTriangle,
  CreditCard,
  Building2,
  Wallet,
  Shield,
  Lock,
} from "lucide-react";
import { ButtonCustom } from "@/components/ui/custom/button";
import { toastCustom } from "@/components/ui/custom/toast";
import { generateSupportWhatsAppLink } from "@/lib/support";
import {
  createCheckoutAndGetUrl,
  canAccessCheckoutResultPage,
} from "@/lib/checkout-session";

export default function CheckoutFalhaPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname() || "";
  const [mounted, setMounted] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const plansPath =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/")
      ? "/dashboard/upgrade"
      : "/recrutamento";

  // Parâmetros da URL
  const paymentId = searchParams.get("payment_id");
  const statusDetail = searchParams.get("status_detail");
  const planId = searchParams.get("plan_id");
  const planName = searchParams.get("plan_name");
  const planPrice = searchParams.get("plan_price");

  // Verifica se o usuário tem acesso válido à página
  useEffect(() => {
    const checkAccess = () => {
      const result = canAccessCheckoutResultPage(searchParams, "rejected");

      if (result.allowed) {
        setHasAccess(true);
        setIsVerifying(false);
        setMounted(true);
      } else {
        // Redireciona para página de planos
        router.replace(plansPath);
      }
    };

    // Pequeno delay para garantir que estamos no cliente
    const timer = setTimeout(checkAccess, 100);
    return () => clearTimeout(timer);
  }, [searchParams, router, plansPath]);

  // Mapeia razões de falha para mensagens amigáveis
  const getFailureMessage = useCallback(() => {
    if (statusDetail) {
      const messages: Record<string, string> = {
        cc_rejected_bad_filled_card_number: "Número do cartão inválido",
        cc_rejected_bad_filled_date: "Data de validade inválida",
        cc_rejected_bad_filled_security_code: "Código de segurança inválido",
        cc_rejected_insufficient_amount: "Saldo insuficiente",
        cc_rejected_call_for_authorize: "Pagamento não autorizado pelo banco",
        cc_rejected_duplicated_payment: "Pagamento duplicado",
        cc_rejected_card_disabled: "Cartão desativado",
        cc_rejected_max_attempts: "Limite de tentativas excedido",
        cc_rejected_high_risk: "Pagamento recusado por segurança",
        cc_rejected_other_reason: "Pagamento recusado pelo banco",
      };
      return (
        messages[statusDetail] || "Não foi possível processar seu pagamento"
      );
    }
    return "Ocorreu um erro ao processar seu pagamento";
  }, [statusDetail]);

  // Função para tentar novamente - cria nova sessão de checkout
  const handleRetry = useCallback(async () => {
    // Se não temos informações do plano, redireciona para a página de planos
    if (!planId || !planName || !planPrice) {
      router.push(plansPath);
      return;
    }

    setIsRetrying(true);

    try {
      // Cria uma nova sessão de checkout com o mesmo plano
      const { url } = createCheckoutAndGetUrl({
        productType: "plano",
        productId: planId,
        productName: decodeURIComponent(planName),
        productPrice: parseFloat(planPrice),
        originUrl: plansPath,
      });

      // Redireciona para o checkout com a nova sessão
      router.push(url);
    } catch (error) {
      console.error("Erro ao criar nova sessão:", error);
      toastCustom.error({
        title: "Erro ao tentar novamente",
        description:
          "Não foi possível criar uma nova sessão. Tente selecionar o plano novamente.",
      });
      setIsRetrying(false);
      router.push(plansPath);
    }
  }, [planId, planName, planPrice, router, plansPath]);

  const suggestions = [
    {
      icon: CreditCard,
      text: "Verifique se os dados do cartão foram inseridos corretamente",
    },
    {
      icon: Wallet,
      text: "Tente outro método de pagamento (PIX ou boleto)",
    },
    {
      icon: Building2,
      text: "Entre em contato com seu banco para verificar o bloqueio",
    },
    {
      icon: CreditCard,
      text: "Use um cartão diferente",
    },
  ];

  // Gerar link do WhatsApp apenas no cliente
  const whatsappLink = mounted
    ? generateSupportWhatsAppLink({
        message: `Olá! Tive um problema com meu pagamento${
          paymentId ? ` (ID: ${paymentId})` : ""
        }. Podem me ajudar?`,
      })
    : "#";

  // Estado de verificação
  if (isVerifying || !hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-slate-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-red-200 border-t-red-500 rounded-full animate-spin" />
            <Lock className="w-6 h-6 text-red-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="!text-zinc-600 !text-sm">Verificando sessão...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-10 mb-10 bg-gradient-to-b from-red-50/80 via-white to-zinc-50 flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Círculos decorativos de fundo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-32 -right-32 w-96 h-96 bg-red-100/50 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.4, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-32 -left-32 w-96 h-96 bg-orange-100/50 rounded-full blur-3xl"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.3, 0.4, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      <div className="max-w-2xl w-full relative z-10">
        {/* Card principal */}
        <motion.div
          className="bg-white rounded-3xl shadow-xl shadow-zinc-200/50 border border-zinc-100 overflow-hidden"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-red-500 via-red-600 to-rose-600 px-6 sm:px-8 py-10 text-center relative overflow-hidden">
            {/* Padrão decorativo */}
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                  backgroundSize: "24px 24px",
                }}
              />
            </div>

            {/* Ícone de erro */}
            <motion.div
              className="relative mx-auto mb-5"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.2,
              }}
            >
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto">
                <XCircle className="w-12 h-12 text-white" />
              </div>
            </motion.div>

            {/* Título */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <p className="!text-sm !font-medium !text-white/80 !mb-2 !uppercase !tracking-wide">
                Pagamento não aprovado
              </p>
              <h1 className="!text-2xl sm:!text-3xl !font-bold !text-white !mb-0">
                {getFailureMessage()}
              </h1>
            </motion.div>
          </div>

          {/* Conteúdo */}
          <div className="px-6 sm:px-8 py-8 space-y-6">
            {/* Mensagem de tranquilização */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full mb-4">
                <Shield className="w-4 h-4 text-emerald-600" />
                <p className="!text-sm !font-medium !text-emerald-700 !mb-0">
                  Nenhum valor foi cobrado
                </p>
              </div>
              <p className="!text-zinc-600 !text-base !leading-relaxed !mb-0">
                Não se preocupe, você pode tentar novamente com outro método de
                pagamento ou verificar os dados informados.
              </p>
            </motion.div>

            {/* ID do pagamento */}
            {paymentId && (
              <motion.div
                className="bg-zinc-50 rounded-xl p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.5 }}
              >
                <p className="!text-xs !font-medium !text-zinc-500 !uppercase !tracking-wide !mb-1">
                  ID da tentativa
                </p>
                <p className="!font-mono !text-sm !text-zinc-900 !mb-0">
                  {paymentId}
                </p>
              </motion.div>
            )}

            {/* Sugestões */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="!text-base !font-semibold !text-zinc-900 !mb-0">
                  O que você pode fazer
                </h3>
              </div>

              <div className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-zinc-50/50 rounded-xl border border-zinc-100"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center">
                      <suggestion.icon className="w-4 h-4 text-zinc-600" />
                    </div>
                    <p className="!text-sm !text-zinc-600 !mb-0 !leading-relaxed pt-1">
                      {suggestion.text}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Botões de ação */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3 pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              <ButtonCustom
                variant="primary"
                size="lg"
                fullWidth
                icon="RefreshCw"
                iconPosition="left"
                onClick={handleRetry}
                isLoading={isRetrying}
                disabled={isRetrying}
                className="flex-1"
              >
                {isRetrying ? "Preparando..." : "Tentar novamente"}
              </ButtonCustom>

              {mounted && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial"
                >
                  <ButtonCustom
                    variant="outline"
                    size="lg"
                    fullWidth
                    icon="MessageCircle"
                    iconPosition="left"
                  >
                    Falar com suporte
                  </ButtonCustom>
                </a>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Link para voltar */}
        <motion.div
          className="text-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.5 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para página inicial
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
