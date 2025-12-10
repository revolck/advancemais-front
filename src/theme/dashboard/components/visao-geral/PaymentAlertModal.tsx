"use client";

import React from "react";
import { AlertTriangle, CreditCard, Sparkles } from "lucide-react";
import {
  ModalCustom,
  ModalContentWrapper,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from "@/components/ui/custom/modal";
import { ButtonCustom } from "@/components/ui/custom";
import { cn } from "@/lib/utils";

interface PaymentAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: "SUSPENSO" | "CANCELADO" | "EXPIRADO";
  planoNome?: string;
  onUpdatePayment?: () => void;
}

const STATUS_CONFIG = {
  SUSPENSO: {
    title: "Atualize suas informações de pagamento",
    description:
      "Não conseguimos processar seu último pagamento. Atualize suas informações de pagamento para continuar utilizando a plataforma.",
    buttonText: "Atualizar Pagamento",
    iconBg: "bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600",
    iconGlow: "shadow-[0_0_30px_rgba(251,146,60,0.4)]",
    borderGradient: "from-amber-500/20 to-orange-500/20",
    canClose: true,
  },
  CANCELADO: {
    title: "Sua assinatura foi cancelada",
    description:
      "Seu plano foi cancelado por falta de pagamento. Reative sua assinatura para voltar a ter acesso completo à plataforma.",
    buttonText: "Reativar Assinatura",
    iconBg: "bg-gradient-to-br from-red-400 via-rose-500 to-red-600",
    iconGlow: "shadow-[0_0_30px_rgba(239,68,68,0.4)]",
    borderGradient: "from-red-500/20 to-rose-500/20",
    canClose: false,
  },
  EXPIRADO: {
    title: "Sua assinatura expirou",
    description:
      "Seu plano expirou. Renove sua assinatura para continuar utilizando todos os recursos da plataforma.",
    buttonText: "Renovar Assinatura",
    iconBg: "bg-gradient-to-br from-red-400 via-rose-500 to-red-600",
    iconGlow: "shadow-[0_0_30px_rgba(239,68,68,0.4)]",
    borderGradient: "from-red-500/20 to-rose-500/20",
    canClose: false,
  },
};

export const PaymentAlertModal: React.FC<PaymentAlertModalProps> = ({
  isOpen,
  onClose,
  status,
  planoNome,
  onUpdatePayment,
}) => {
  const config = STATUS_CONFIG[status];

  const handleUpdatePayment = () => {
    if (onUpdatePayment) {
      onUpdatePayment();
    } else {
      // Redirecionar para página de pagamento
      window.location.href = "/empresa/assinatura";
    }
  };

  return (
    <ModalCustom
      isOpen={isOpen}
      onClose={onClose}
      onOpenChange={(open) => {
        if (!open && config.canClose) {
          onClose();
        }
      }}
      size="md"
      backdrop="blur"
      isDismissable={config.canClose}
      isKeyboardDismissDisabled={!config.canClose}
      hideCloseButton={!config.canClose}
      classNames={{
        base: "bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a] border border-gray-800/50 p-0 shadow-2xl",
      }}
    >
      <ModalContentWrapper>
        {/* Header com ícone e gradiente sutil */}
        <div className="relative pt-12 pb-8 px-8">
          {/* Gradiente decorativo no topo */}
          <div
            className={cn(
              "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-60",
              config.borderGradient
            )}
          />

          {/* Container do ícone com animação */}
          <div className="flex flex-col items-center mb-6">
            {/* Círculo externo com glow */}
            <div
              className={cn(
                "relative w-20 h-20 rounded-full flex items-center justify-center mb-5",
                config.iconBg,
                config.iconGlow,
                "animate-pulse"
              )}
            >
              {/* Círculo interno para profundidade */}
              <div className="absolute inset-2 rounded-full bg-white/10 backdrop-blur-sm" />
              <AlertTriangle className="size-10 text-white relative z-10 drop-shadow-lg" />
            </div>

            {/* Badge do plano (se houver) */}
            {planoNome && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4">
                <Sparkles className="size-3 text-gray-400" />
                <span className="text-xs font-medium text-gray-300">
                  {planoNome}
                </span>
              </div>
            )}
          </div>

          <ModalHeader className="text-center! space-y-3!">
            <ModalTitle className="text-2xl! font-bold! text-white! mb-0! tracking-tight!">
              {config.title}
            </ModalTitle>
            <ModalDescription className="text-gray-300! text-base! leading-relaxed! max-w-md! mx-auto!">
              {config.description}
            </ModalDescription>
          </ModalHeader>
        </div>

        {/* Divider sutil */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mx-8" />

        {/* Footer com botão */}
        <ModalFooter className="px-8! pb-8! pt-6! flex-col! gap-3!">
          <ButtonCustom
            onClick={handleUpdatePayment}
            variant="primary"
            size="md"
            fullWidth
            className="h-12! bg-white! hover:bg-gray-50! active:bg-gray-100! text-gray-900! font-semibold! rounded-xl! shadow-lg! shadow-white/10! transition-all! duration-200! hover:scale-[1.02]! active:scale-[0.98]!"
          >
            <CreditCard className="size-5 mr-2" />
            {config.buttonText}
          </ButtonCustom>

          {config.canClose && (
            <button
              onClick={onClose}
              className="w-full mt-1 text-sm text-(--secondary-color) cursor-pointer hover:text-(--secondary-color)/80 transition-colors font-medium py-2"
            >
              Lembrar mais tarde
            </button>
          )}
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
};
