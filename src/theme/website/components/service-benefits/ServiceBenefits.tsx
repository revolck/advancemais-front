// src/theme/website/components/service-benefits/ServiceBenefits.tsx

"use client";

import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { ServiceBenefitsItem } from "./components/ServiceBenefitsItem";
import { useServiceBenefits } from "./hooks/useServiceBenefits";
import { ImageNotFound } from "@/components/ui/custom/image-not-found";
import { ButtonCustom } from "@/components/ui/custom/button";
import type { ServiceBenefitsProps } from "./types";

/**
 * Componente ServiceBenefits
 * Exibe seções de benefícios de serviços com imagem e lista de vantagens
 *
 * @example
 * ```tsx
 * // Uso básico com dados da API
 * <ServiceBenefits service="recrutamento" />
 *
 * // Com dados estáticos
 * <ServiceBenefits
 *   fetchFromApi={false}
 *   staticData={myServiceBenefitsData}
 * />
 * ```
 */
const ServiceBenefits: React.FC<ServiceBenefitsProps> = ({
  className,
  service,
  fetchFromApi = true,
  staticData,
  onDataLoaded,
  onError,
}) => {
  const { data, isLoading, error, refetch } = useServiceBenefits(
    service,
    fetchFromApi,
    staticData,
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

  // Estado de carregamento
  if (isLoading) {
    return (
      <div className={cn("py-8", className)}>
        {Array.from({ length: 2 }).map((_, index) => (
          <section
            key={index}
            className="pxResponsive container mx-auto py-14 flex flex-col lg:flex-row items-center gap-8"
          >
            {/* Skeleton da imagem */}
            <div className="lg:w-1/2 w-full">
              <div className="w-full h-64 lg:h-80 bg-gray-200 animate-pulse rounded-lg" />
            </div>

            {/* Skeleton do texto */}
            <div className="lg:w-1/2 w-full space-y-4">
              <div className="h-8 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
              </div>
              <div className="space-y-3 mt-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-10 bg-gray-200 rounded-full animate-pulse w-3/4"
                  />
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>
    );
  }

  // Estado de erro (com opção de retry)
  if (error && (!data || data.length === 0)) {
    return (
      <div className={cn("py-16", className)}>
        <div className="container mx-auto px-4 text-center">
          <ImageNotFound
            size="lg"
            variant="error"
            message="Erro ao carregar benefícios dos serviços"
            icon="AlertCircle"
            className="mx-auto mb-6"
          />
          <p className="text-gray-600 mb-4 max-w-md mx-auto">
            Não foi possível carregar as informações dos benefícios.
            {error.includes("padrão") ? " Exibindo dados de exemplo." : ""}
          </p>
          {!error.includes("padrão") && (
            <ButtonCustom onClick={refetch} variant="default" icon="RefreshCw">
              Tentar Novamente
            </ButtonCustom>
          )}
        </div>
      </div>
    );
  }

  // Estado normal com dados
  return (
    <div className={cn("py-8", className)}>
      {data.map((item, index) => (
        <ServiceBenefitsItem key={item.id} data={item} index={index} />
      ))}

      {/* Indicador de erro sutil se houver fallback */}
      {error && data.length > 0 && (
        <div className="text-center mt-8">
          <span className="text-xs text-gray-500">Dados de exemplo</span>
        </div>
      )}
    </div>
  );
};

export default ServiceBenefits;
