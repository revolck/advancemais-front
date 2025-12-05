// src/app/website/checkout/sucesso/page.tsx

"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Sparkles,
  Mail,
  Briefcase,
  Headphones,
  PartyPopper,
  Shield,
  Lock,
} from "lucide-react";
import { ButtonCustom } from "@/components/ui/custom/button";
import { canAccessCheckoutResultPage } from "@/lib/checkout-session";

// Cores vibrantes para os confetes
const CONFETTI_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E9",
  "#F1948A",
  "#82E0AA",
  "#F8B500",
  "#E74C3C",
  "#3498DB",
  "#2ECC71",
];

interface ConfettiPiece {
  id: number;
  color: string;
  size: number;
  initialX: number;
  initialY: number;
  targetX: number;
  targetY: number;
  rotation: number;
  delay: number;
}

// Componente de explosão de confetes (renderiza apenas no cliente)
const ConfettiExplosion = ({ isActive }: { isActive: boolean }) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [mounted, setMounted] = useState(false);

  // Gera confetes apenas no cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isActive) {
      setPieces([]);
      return;
    }

    // Gerar confetes apenas quando ativo
    const newPieces: ConfettiPiece[] = [];
    const count = 80; // Quantidade reduzida para melhor performance

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.8;
      const velocity = 200 + Math.random() * 400;

      newPieces.push({
        id: i,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 8 + Math.random() * 8,
        initialX: 50,
        initialY: 35,
        targetX: 50 + Math.cos(angle) * (velocity / 10),
        targetY: 35 + Math.sin(angle) * (velocity / 10) + 60,
        rotation: Math.random() * 720 - 360,
        delay: Math.random() * 0.15,
      });
    }

    setPieces(newPieces);

    // Limpa os confetes após a animação
    const timer = setTimeout(() => {
      setPieces([]);
    }, 3000);

    return () => clearTimeout(timer);
  }, [mounted, isActive]);

  if (!mounted || pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute rounded-sm"
          style={{
            width: piece.size,
            height: piece.size * 0.6,
            backgroundColor: piece.color,
            left: `${piece.initialX}%`,
            top: `${piece.initialY}%`,
          }}
          initial={{
            scale: 0,
            rotate: 0,
            opacity: 1,
          }}
          animate={{
            x: `${(piece.targetX - piece.initialX) * 10}px`,
            y: `${(piece.targetY - piece.initialY) * 10}px`,
            scale: [0, 1.2, 1, 0.8],
            rotate: piece.rotation,
            opacity: [1, 1, 1, 0],
          }}
          transition={{
            duration: 2,
            delay: piece.delay,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        />
      ))}
    </div>
  );
};

export default function CheckoutSucessoPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);

  const paymentId = searchParams.get("payment_id");

  // Verifica se o usuário tem acesso válido à página
  useEffect(() => {
    const checkAccess = () => {
      const result = canAccessCheckoutResultPage(searchParams, "approved");

      if (result.allowed) {
        setHasAccess(true);
        setIsVerifying(false);

        // Dispara confetes após verificação
        setTimeout(() => setShowConfetti(true), 500);
      } else {
        // Redireciona para página de planos
        router.replace("/recrutamento");
      }
    };

    // Pequeno delay para garantir que estamos no cliente
    const timer = setTimeout(checkAccess, 100);
    return () => clearTimeout(timer);
  }, [searchParams, router]);

  // Função para disparar mais confetes
  const triggerConfetti = useCallback(() => {
    setShowConfetti(false);
    setTimeout(() => {
      setShowConfetti(true);
      setConfettiKey((prev) => prev + 1);
    }, 50);
  }, []);

  const nextSteps = [
    {
      icon: Mail,
      title: "Confirmação por e-mail",
      description:
        "Você receberá um e-mail com os detalhes da sua assinatura em instantes.",
    },
    {
      icon: Briefcase,
      title: "Publique suas vagas",
      description:
        "Acesse o dashboard e comece a publicar suas vagas imediatamente.",
    },
    {
      icon: Headphones,
      title: "Suporte dedicado",
      description:
        "Nossa equipe está à disposição para ajudar no que você precisar.",
    },
  ];

  // Estado de verificação
  if (isVerifying || !hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
            <Lock className="w-6 h-6 text-emerald-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="!text-zinc-600 !text-sm">Verificando sessão...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-10 mb-10 bg-gradient-to-b from-emerald-50/80 via-white to-zinc-50 flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Explosão de confetes */}
      <ConfettiExplosion key={confettiKey} isActive={showConfetti} />

      {/* Círculos decorativos de fundo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl"
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
          className="absolute -bottom-32 -left-32 w-96 h-96 bg-teal-100/50 rounded-full blur-3xl"
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
          <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 px-6 sm:px-8 py-10 text-center relative overflow-hidden">
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

            {/* Ícone de sucesso - clicável para disparar confetes */}
            <motion.div
              className="relative mx-auto mb-5 cursor-pointer"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={triggerConfetti}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.2,
              }}
              title="Clique para mais confetes! 🎉"
            >
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: 0.4,
                  }}
                >
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </motion.div>
              </div>

              {/* Sparkles ao redor */}
              <motion.div
                className="absolute -top-1 -right-1"
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Sparkles className="w-5 h-5 text-yellow-300" />
              </motion.div>
              <motion.div
                className="absolute -bottom-1 -left-1"
                initial={{ scale: 0, rotate: 45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.7 }}
              >
                <PartyPopper className="w-5 h-5 text-yellow-300" />
              </motion.div>
            </motion.div>

            {/* Título */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <p className="!text-sm !font-medium !text-white/80 !mb-2 !uppercase !tracking-wide">
                Pagamento aprovado
              </p>
              <h1 className="!text-2xl sm:!text-3xl !font-bold !text-white !mb-0">
                Bem-vindo ao AdvanceMais! 🎉
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
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full mb-4">
                <Shield className="w-4 h-4 text-emerald-600" />
                <p className="!text-sm !font-medium !text-emerald-700 !mb-0">
                  Transação segura confirmada
                </p>
              </div>
              <p className="!text-zinc-600 !text-base !leading-relaxed !mb-0">
                Sua assinatura foi ativada com sucesso. Agora você tem acesso
                completo a todas as funcionalidades do seu plano.
              </p>
            </motion.div>

            {/* ID do pagamento */}
            {paymentId && (
              <motion.div
                className="bg-zinc-50 rounded-xl p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.5 }}
              >
                <p className="!text-xs !font-medium !text-zinc-500 !uppercase !tracking-wide !mb-1">
                  ID do pagamento
                </p>
                <p className="!font-mono !text-sm !text-zinc-900 !mb-0">
                  {paymentId}
                </p>
              </motion.div>
            )}

            {/* Próximos passos */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <h3 className="!text-base !font-semibold !text-zinc-900 !mb-0">
                Próximos passos
              </h3>

              <div className="space-y-3">
                {nextSteps.map((step, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-zinc-50/50 rounded-xl border border-zinc-100"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1, duration: 0.4 }}
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <step.icon className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="!text-sm !font-semibold !text-zinc-900 !mb-1">
                        {step.title}
                      </h4>
                      <p className="!text-sm !text-zinc-600 !mb-0 !leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Botões de ação */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3 pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
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
            </motion.div>
          </div>
        </motion.div>

        {/* Footer com dica */}
        <motion.p
          className="text-center mt-6 !text-sm !text-zinc-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.5 }}
        >
          Dúvidas? Entre em contato com nosso{" "}
          <Link href="/contato" className="text-emerald-600 hover:underline">
            suporte
          </Link>
        </motion.p>
      </div>
    </div>
  );
}
