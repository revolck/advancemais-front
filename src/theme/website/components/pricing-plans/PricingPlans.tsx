// src/theme/website/components/pricing-plans/PricingPlans.tsx

"use client";

import React, { useEffect } from "react";
import { ButtonCustom } from "@/components/ui/custom/button";
import { ImageNotFound } from "@/components/ui/custom/image-not-found";
import { cn } from "@/lib/utils";
import { PricingPlanCard } from "./components/PricingPlanCard";
import { PRICING_CONFIG } from "./constants";
import { usePricingData } from "./hooks/usePricingData";
import type { PricingPlansProps } from "./types";

/**
 * Componente PricingPlans
 * Exibe tabela de preços com planos organizados
 *
 * @example
 * ```tsx
 * // Uso básico com dados da API
 * <PricingPlans />
 *
 * // Com dados estáticos
 * <PricingPlans
 *   fetchFromApi={false}
 *   staticData={myPricingData}
 * />
 *
 * // Com títulos customizados
 * <PricingPlans
 *   title="Nossos Planos"
 *   subtitle="Escolha o melhor para você"
 *   onPlanSelect={(plan) => console.log('Plano selecionado:', plan)}
 * />
 * ```
 */
const PricingPlans: React.FC<PricingPlansProps> = ({
  className,
  title = "Escolha seu plano",
  subtitle = "Você pode mudar de plano a qualquer momento.",
  fetchFromApi = true,
  staticData,
  onDataLoaded,
  onError,
  onPlanSelect,
}) => {
  const { data, isLoading, error, refetch } = usePricingData(
    fetchFromApi,
    staticData
  );

  // Callbacks quando dados são carregados ou há erro
  useEffect(() => {
    if (data && data.length > 0 && !isLoading) {
      onDataLoaded?.(data);
    }
  }, [data, isLoading, onDataLoaded]);

  useEffect(() => {
    if (error) {
      onError?.(error);
    }
  }, [error, onError]);

  // Handler para seleção de plano
  const handlePlanSelect = (plan: any) => {
    onPlanSelect?.(plan);

    // Navegação padrão se não houver callback customizado
    if (!onPlanSelect) {
      window.location.href = plan.buttonUrl;
    }
  };

  // Estado de carregamento
  if (isLoading) {
    return (
      <div className={cn("container w-full mx-auto py-24", className)}>
        <div className="text-center animate-fade-in mb-12">
          <div className="h-10 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse" />
          <div className="h-6 bg-gray-200 rounded w-96 mx-auto animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: PRICING_CONFIG.grid.desktop }).map((_, index) => (
            <div
              key={index}
              className="rounded-lg p-6 bg-white shadow-medium border border-gray-200"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
                <div className="h-5 bg-gray-200 rounded w-20 animate-pulse" />
              </div>
              <div className="h-12 bg-gray-200 rounded mb-4 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded mb-6 animate-pulse" />
              <div className="h-10 bg-gray-200 rounded mb-6 animate-pulse" />
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Estado de erro (com opção de retry)
  if (error && (!data || data.length === 0)) {
    return (
      <div className={cn("container w-full mx-auto py-24", className)}>
        <div className="text-center">
          <ImageNotFound
            size="lg"
            variant="error"
            message="Erro ao carregar planos"
            icon="AlertCircle"
            className="mx-auto mb-6"
          />
          <p className="text-gray-600 mb-4 max-w-md mx-auto">
            {error}
          </p>
          <ButtonCustom onClick={refetch} variant="default" icon="RefreshCw">
            Tentar Novamente
          </ButtonCustom>
        </div>
      </div>
    );
  }

  if (!isLoading && data.length === 0) {
    return (
      <div className={cn("container w-full mx-auto py-24", className)}>
        <div className="text-center">
          <ImageNotFound
            size="md"
            variant="muted"
            message="Nenhum plano empresarial disponível no momento"
            icon="FileQuestion"
            className="mx-auto mb-6"
          />
          <ButtonCustom onClick={refetch} variant="default" icon="RefreshCw">
            Atualizar
          </ButtonCustom>
        </div>
      </div>
    );
  }

  // Estado normal com dados
  return (
    <div
      className={cn("container w-full mx-auto py-24", className)}
    >
      {/* Header da seção */}
      <div className="text-center animate-fade-in mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          {title}
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
          {subtitle}
        </p>
      </div>

      {/* Grid de planos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.map((plan, index) => (
          <PricingPlanCard
            key={plan.id}
            plan={plan}
            index={index}
            onSelect={handlePlanSelect}
          />
        ))}
      </div>

      {/* Indicador de erro sutil se houver falha parcial */}
      {error && data.length > 0 && (
        <div className="text-center mt-8">
          <span className="text-xs text-gray-500">
            Alguns dados podem estar indisponíveis no momento.
          </span>
        </div>
      )}
    </div>
  );
};

export default PricingPlans;
