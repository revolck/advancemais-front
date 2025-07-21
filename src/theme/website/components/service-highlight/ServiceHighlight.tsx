// src/theme/website/components/service-highlight/ServiceHighlight.tsx

"use client";

import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { HighlightSection } from "./components/HighlightSection";
import { useServiceHighlightData } from "./hooks/useServiceHighlightData";
import { ImageNotFound } from "@/components/ui/custom/image-not-found";
import { ButtonCustom } from "@/components/ui/custom/button";
import type { ServiceHighlightProps } from "./types";

/**
 * Componente ServiceHighlight
 * Exibe seções de destaque de serviços com imagem central e benefícios
 *
 * @example
 * ```tsx
 * // Uso básico com dados da API
 * <ServiceHighlight />
 *
 * // Com dados estáticos
 * <ServiceHighlight
 *   fetchFromApi={false}
 *   staticData={myServiceData}
 * />
 * ```
 */
const ServiceHighlight: React.FC<ServiceHighlightProps> = ({
  className,
  fetchFromApi = true,
  staticData,
  onDataLoaded,
  onError,
}) => {
  const { data, isLoading, error, refetch } = useServiceHighlightData(
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

  // Estado de carregamento
  if (isLoading) {
    return (
      <div className={cn("py-8", className)}>
        {Array.from({ length: 1 }).map((_, index) => (
          <section
            key={index}
            className="pxResponsive container mx-auto py-14 grid lg:grid-cols-3 gap-16 items-center"
          >
            {/* Skeleton do texto */}
            <div className="lg:col-span-1 space-y-4">
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3" />
              </div>
            </div>

            {/* Skeleton da imagem */}
            <div className="lg:col-span-1 flex justify-center">
              <div className="aspect-[3/2] w-full max-w-[600px] bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg shadow-lg" />
            </div>

            {/* Skeleton dos benefícios */}
            <div className="lg:col-span-1 space-y-6">
              {Array.from({ length: 3 }).map((_, benefitIndex) => (
                <div key={benefitIndex} className="space-y-2">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-5/6" />
                </div>
              ))}
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
            message="Erro ao carregar destaques de serviço"
            icon="AlertCircle"
            className="mx-auto mb-6"
          />
          <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto">
            Não foi possível carregar as informações dos serviços.
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
        <HighlightSection key={item.id} data={item} index={index} />
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

export default ServiceHighlight;
