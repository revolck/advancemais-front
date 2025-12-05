// src/app/website/checkout/pendente/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Clock,
  ArrowLeft,
  Mail,
  Copy,
  CheckCircle2,
  Loader2,
  Zap,
  FileText,
  BellRing,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { ButtonCustom } from "@/components/ui/custom/button";
import { cn } from "@/lib/utils";
import { canAccessCheckoutResultPage } from "@/lib/checkout-session";

export default function CheckoutPendentePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const paymentId = searchParams.get("payment_id");
  const preferenceId = searchParams.get("preference_id");
  const externalReference = searchParams.get("external_reference");

  // Verifica se o usuário tem acesso válido à página
  useEffect(() => {
    const checkAccess = () => {
      const result = canAccessCheckoutResultPage(searchParams, "pending");

      if (result.allowed) {
        setHasAccess(true);
        setIsVerifying(false);
      } else {
        // Redireciona para página de planos
        router.replace("/recrutamento");
      }
    };

    // Pequeno delay para garantir que estamos no cliente
    const timer = setTimeout(checkAccess, 100);
    return () => clearTimeout(timer);
  }, [searchParams, router]);

  const handleCopyId = () => {
    const idToCopy = paymentId || preferenceId || externalReference;
    if (idToCopy) {
      navigator.clipboard.writeText(idToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const displayId = paymentId || preferenceId || externalReference;
  const idLabel = paymentId
    ? "ID do pagamento"
    : preferenceId
    ? "ID da preferência"
    : "Referência";

  const steps = [
    {
      icon: Zap,
      title: "PIX",
      description: "O pagamento é processado em até 30 minutos",
    },
    {
      icon: FileText,
      title: "Boleto",
      description: "O prazo é de 1 a 2 dias úteis após o pagamento",
    },
    {
      icon: BellRing,
      title: "Notificação",
      description: "Você receberá um e-mail assim que o pagamento for aprovado",
    },
  ];

  // Estado de verificação
  if (isVerifying || !hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-slate-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
            <Lock className="w-6 h-6 text-amber-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="!text-zinc-600 !text-sm">Verificando sessão...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-10 mb-10 bg-gradient-to-b from-amber-50/80 via-white to-zinc-50 flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Círculos decorativos de fundo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-32 -right-32 w-96 h-96 bg-amber-100/50 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
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
            opacity: [0.3, 0.5, 0.3],
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
          {/* Header com gradiente */}
          <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 px-6 sm:px-8 py-10 text-center relative overflow-hidden">
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

            {/* Ícone de pendente */}
            <motion.div
              className="relative mx-auto mb-5"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.2,
              }}
            >
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <Loader2 className="w-12 h-12 text-white" />
                </motion.div>
              </div>

              {/* Efeito de pulso */}
              <motion.div
                className="absolute inset-0 w-20 h-20 mx-auto rounded-full border-2 border-white/30"
                animate={{
                  scale: [1, 1.3, 1.3],
                  opacity: [0.5, 0, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
            </motion.div>

            {/* Título */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-white/80" />
                <p className="!text-sm !font-medium !text-white/80 !mb-0 !uppercase !tracking-wide">
                  Em processamento
                </p>
              </div>
              <h1 className="!text-2xl sm:!text-3xl !font-bold !text-white !mb-0">
                Pagamento em análise
              </h1>
            </motion.div>
          </div>

          {/* Conteúdo */}
          <div className="px-6 sm:px-8 py-8 space-y-6">
            {/* Mensagem principal */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <p className="!text-zinc-600 !text-base sm:!text-lg !leading-relaxed !mb-0">
                Estamos processando seu pagamento. Assim que for confirmado,
                você receberá um e-mail e sua assinatura será ativada
                automaticamente.
              </p>
            </motion.div>

            {/* ID do pagamento */}
            {displayId && (
              <motion.div
                className="bg-zinc-50 rounded-xl p-4 flex items-center justify-between gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.5 }}
              >
                <div className="min-w-0 flex-1">
                  <p className="!text-xs !font-medium !text-zinc-500 !uppercase !tracking-wide !mb-1">
                    {idLabel}
                  </p>
                  <p className="!font-mono !text-sm !text-zinc-900 !mb-0 truncate">
                    {displayId}
                  </p>
                </div>
                <ButtonCustom
                  variant="outline"
                  size="sm"
                  onClick={handleCopyId}
                  className={cn(
                    "!h-9 !px-3 flex-shrink-0",
                    copied && "!text-emerald-600 !border-emerald-200"
                  )}
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copiar
                    </>
                  )}
                </ButtonCustom>
              </motion.div>
            )}

            {/* O que acontece agora */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <h3 className="!text-base !font-semibold !text-zinc-900 !mb-0 flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-500" />O que acontece agora?
              </h3>

              <div className="space-y-3">
                {steps.map((step, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start gap-4 p-4 bg-zinc-50/50 rounded-xl border border-zinc-100"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <step.icon className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="!text-sm !font-medium !text-zinc-900 !mb-0">
                        {step.title}
                      </p>
                      <p className="!text-sm !text-zinc-500 !mb-0 !leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Aviso importante */}
            <motion.div
              className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="!text-sm !font-medium !text-amber-800 !mb-1">
                  Importante
                </p>
                <p className="!text-sm !text-amber-700 !mb-0 !leading-relaxed">
                  Não efetue um novo pagamento enquanto este estiver em análise
                  para evitar cobranças duplicadas.
                </p>
              </div>
            </motion.div>

            {/* Botões de ação */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3 pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              <Link href="/dashboard" className="flex-1">
                <ButtonCustom
                  variant="primary"
                  size="lg"
                  fullWidth
                  icon="LayoutDashboard"
                  iconPosition="left"
                >
                  Ir para o Dashboard
                </ButtonCustom>
              </Link>
              <Link href="/" className="flex-1 sm:flex-initial">
                <ButtonCustom
                  variant="outline"
                  size="lg"
                  fullWidth
                  icon="ArrowLeft"
                  iconPosition="left"
                >
                  Voltar para início
                </ButtonCustom>
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Nota de suporte */}
        <motion.p
          className="!text-center !text-sm !text-zinc-500 !mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.5 }}
        >
          Dúvidas sobre seu pagamento? Entre em contato pelo{" "}
          <a
            href="mailto:suporte@advancemais.com.br"
            className="text-amber-600 hover:text-amber-700 hover:underline font-medium transition-colors"
          >
            suporte@advancemais.com.br
          </a>
        </motion.p>
      </div>
    </div>
  );
}
