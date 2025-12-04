// src/theme/website/components/pricing-plans/components/PricingPlanCard.tsx

"use client";

import React from "react";
import { ButtonCustom } from "@/components/ui/custom/button";
import { Icon, Icons, type IconName } from "@/components/ui/custom/Icons";
import { Check } from "lucide-react";
import { PRICING_CONFIG } from "../constants";
import type { PricingPlanCardProps } from "../types";
import type { PlanButtonState } from "../hooks/usePricingActions";
import { cn } from "@/lib/utils";
import { env } from "@/lib/env";

export interface ExtendedPricingPlanCardProps extends PricingPlanCardProps {
  /** Estado do botão (opcional - se não fornecido, usa comportamento padrão) */
  buttonState?: PlanButtonState;
  /** Handler customizado de clique */
  onButtonClick?: () => void;
  /** Link do WhatsApp (fallback caso buttonState.href não esteja disponível) */
  whatsappLink?: string | null;
}

// Componente de ícone do WhatsApp
const WhatsAppIcon: React.FC<{ className?: string; size?: number }> = ({
  className = "",
  size = 20,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

// Mapeamento de ações para ícones do ButtonCustom
const buttonIconsMap: Record<string, string> = {
  comprar: "Crown",
  upgrade: "ArrowUp",
  alterar_plano: "RefreshCw",
  plano_atual: "Check",
  contato: "MessageCircle", // Será substituído por componente customizado
};

export const PricingPlanCard: React.FC<ExtendedPricingPlanCardProps> = ({
  plan,
  index,
  onSelect,
  buttonState,
  onButtonClick,
  whatsappLink,
}) => {
  const handleSelectPlan = () => {
    if (onButtonClick) {
      onButtonClick();
    } else {
      onSelect?.(plan);
    }
  };

  // Validação do ícone
  const iconName: IconName = Icons.exists(plan.iconName)
    ? plan.iconName
    : (PRICING_CONFIG.icons.fallbackIcon as IconName);

  // Determina o texto e estado do botão
  const displayText = buttonState?.text ?? plan.buttonText;
  const isDisabled = buttonState?.disabled ?? false;
  const buttonAction = buttonState?.action ?? "comprar";

  // Se é link externo (WhatsApp), abre em nova aba
  const handleClick = (e?: React.MouseEvent) => {
    // Se a ação é "contato", sempre tenta abrir WhatsApp
    if (buttonAction === "contato") {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      // Tenta usar o href do buttonState primeiro, depois whatsappLink
      const link = buttonState?.href || whatsappLink;

      if (link) {
        window.open(link, "_blank", "noopener,noreferrer");
        return;
      }

      // Se não tem link, chama o handler do hook (ele tem a lógica completa)
      if (onButtonClick) {
        onButtonClick();
        return;
      }

      // Último recurso: usa número padrão do env com nome do plano
      const defaultPhone = env.supportPhone;
      const message = plan.title
        ? `Olá! Tenho interesse no plano "${plan.title}" da Advance+. Gostaria de mais informações sobre valores e condições.`
        : "Olá! Gostaria de saber mais sobre os planos empresariais da Advance+.";
      const defaultMessage = encodeURIComponent(message);
      const phoneWithCountry = defaultPhone.startsWith("55")
        ? defaultPhone
        : `55${defaultPhone}`;
      const fallbackLink = `https://wa.me/${phoneWithCountry}?text=${defaultMessage}`;
      window.open(fallbackLink, "_blank", "noopener,noreferrer");
      return;
    }
    // Para outras ações, usa o fluxo normal
    handleSelectPlan();
  };

  // Determina a variante do botão baseado na ação
  const getButtonVariant = () => {
    if (buttonAction === "plano_atual") return "ghost";
    return "primary";
  };

  return (
    <div
      className={cn(
        "rounded-lg p-6 flex flex-col relative",
        "transition-all duration-300 hover:hover-lift",
        plan.isPopular
          ? "bg-white border-2 border-red-500 shadow-strong"
          : "bg-white shadow-medium border border-gray-200 hover:shadow-strong"
      )}
      style={{
        animationDelay: `${index * PRICING_CONFIG.animation.staggerDelay}ms`,
      }}
    >
      {/* Badge de popular */}
      {plan.isPopular && (
        <div className="absolute -top-3 right-4 bg-red-500 text-white text-xs px-3 py-1 rounded-full font-medium">
          Mais popular
        </div>
      )}

      {/* Badge de plano atual */}
      {buttonAction === "plano_atual" && (
        <div className="absolute -top-3 left-4 bg-green-500 text-white text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
          <Check className="w-3 h-3" />
          Ativo
        </div>
      )}

      {/* Header com ícone e título */}
      <div className="flex items-center gap-2 mb-4">
        <div
          className={cn(
            "p-2.5 rounded-xl",
            plan.isPopular
              ? "bg-red-50 text-red-500"
              : buttonAction === "plano_atual"
              ? "bg-emerald-50 text-emerald-600"
              : "bg-slate-100/80 text-slate-500"
          )}
        >
          <Icon
            name={iconName as any}
            size={PRICING_CONFIG.icons.defaultSize}
          />
        </div>
        <span className="text-gray-900 font-medium text-lg">{plan.title}</span>
      </div>

      {/* Preço */}
      <div className="mb-4">
        <div className="flex items-baseline gap-1">
          <span className="text-gray-600 text-base">{plan.currency}</span>
          <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
          <span className="text-gray-500 text-sm">/{plan.period}</span>
        </div>
      </div>

      {/* Descrição rápida */}
      {plan.description && plan.description.trim() && (
        <div className="text-sm text-gray-500 mb-6">{plan.description}</div>
      )}

      {/* Botão de ação */}
      <ButtonCustom
        onClick={handleClick}
        disabled={isDisabled}
        variant={getButtonVariant()}
        size="lg"
        fullWidth
        icon={
          buttonAction === "contato"
            ? undefined
            : (buttonIconsMap[buttonAction] as any)
        }
        className={cn(
          "mb-6",
          buttonAction === "plano_atual" && "cursor-not-allowed opacity-60"
        )}
      >
        {buttonAction === "contato" ? (
          <span className="flex items-center justify-center gap-2">
            <WhatsAppIcon size={20} />
            {displayText}
          </span>
        ) : (
          displayText
        )}
      </ButtonCustom>

      {/* Lista de recursos */}
      <ul className="space-y-3 flex-1">
        {plan.features.map((feature, featureIndex) => (
          <li
            key={featureIndex}
            className="flex items-start gap-3 text-gray-600 text-sm"
          >
            <div
              className={cn(
                "flex items-center justify-center w-5 h-5 rounded-full flex-shrink-0 mt-0.5",
                plan.isPopular
                  ? "bg-red-100 text-red-500"
                  : buttonAction === "plano_atual"
                  ? "bg-green-100 text-green-500"
                  : "bg-gray-100 text-gray-400"
              )}
            >
              <Check size={12} />
            </div>
            <span className="leading-relaxed">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
