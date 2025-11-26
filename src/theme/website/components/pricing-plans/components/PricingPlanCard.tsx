// src/theme/website/components/pricing-plans/components/PricingPlanCard.tsx

"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Icon, Icons, type IconName } from "@/components/ui/custom/Icons";
import { Check } from "lucide-react";
import { PRICING_CONFIG } from "../constants";
import type { PricingPlanCardProps } from "../types";

export const PricingPlanCard: React.FC<PricingPlanCardProps> = ({
  plan,
  index,
  onSelect,
}) => {
  const handleSelectPlan = () => {
    onSelect?.(plan);
  };

  // Validação do ícone
  const iconName: IconName = Icons.exists(plan.iconName)
    ? plan.iconName
    : (PRICING_CONFIG.icons.fallbackIcon as IconName);

  return (
    <div
      className={`
        rounded-lg p-6 flex flex-col relative
        transition-all duration-300 hover:hover-lift
        ${
          plan.isPopular
            ? "bg-white border-2 border-red-500 shadow-strong"
            : "bg-white shadow-medium border border-gray-200 hover:shadow-strong"
        }
      `}
      style={{
        // Animação de entrada com stagger
        animationDelay: `${index * PRICING_CONFIG.animation.staggerDelay}ms`,
      }}
    >
      {/* Badge de popular */}
      {plan.isPopular && (
        <div className="absolute -top-3 right-4 bg-red-500 text-white text-xs px-3 py-1 rounded-full font-medium">
          Mais popular
        </div>
      )}

      {/* Header com ícone e título */}
      <div className="flex items-center gap-2 mb-4">
        <div
          className={`
          p-2 rounded-lg
          ${
            plan.isPopular
              ? "bg-red-50 text-red-500"
              : "bg-gray-50 text-gray-600"
          }
        `}
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

      {/* Descrição rápida - só renderiza se houver descrição válida */}
      {plan.description && plan.description.trim() && (
      <div className="text-sm text-gray-500 mb-6">{plan.description}</div>
      )}

      {/* Botão de ação */}
      <Button
        onClick={handleSelectPlan}
        className={`
          w-full mb-6 transition-all duration-200 hover:hover-scale
          ${
            plan.isPopular
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-gray-700 hover:bg-gray-800 text-white"
          }
        `}
        size="lg"
      >
        {plan.buttonText}
      </Button>

      {/* Lista de recursos */}
      <ul className="space-y-3 flex-1">
        {plan.features.map((feature, featureIndex) => (
          <li
            key={featureIndex}
            className="flex items-start gap-3 text-gray-600 text-sm"
          >
            <div
              className={`
              flex items-center justify-center w-5 h-5 rounded-full flex-shrink-0 mt-0.5
              ${
                plan.isPopular
                  ? "bg-red-100 text-red-500"
                  : "bg-gray-100 text-gray-400"
              }
            `}
            >
              <Check size={12} />
            </div>
            <span className="leading-relaxed">{feature}</span>
          </li>
        ))}
      </ul>

      {/* Footer adicional se necessário */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">
          Cancele a qualquer momento
        </p>
      </div>
    </div>
  );
};
