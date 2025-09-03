// src/theme/website/components/advance-ajuda/AdvanceAjuda.tsx

"use client";

import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { HighlightSection } from "./components/HighlightSection";
import { useAdvanceAjudaData } from "./hooks/useAdvanceAjudaData";
import { ImageNotFound } from "@/components/ui/custom/image-not-found";
import { ButtonCustom } from "@/components/ui/custom/button";
import type { AdvanceAjudaProps } from "./types";

/**
 * Componente AdvanceAjuda
 * Exibe seções de destaque do serviço Advance Ajuda com imagem central e benefícios
 *
 * @example
 * ```tsx
 * // Uso básico com dados da API
 * <AdvanceAjuda />
 *
 * // Com dados estáticos
 * <AdvanceAjuda
 *   fetchFromApi={false}
 *   staticData={myServiceData}
 * />
 * ```
 */
const AdvanceAjuda: React.FC<AdvanceAjudaProps> = ({
  className,
  fetchFromApi = true,
  staticData,
  onDataLoaded,
  onError,
}) => {
  const { data, isLoading, error, refetch } = useAdvanceAjudaData(
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
              <div className="h-12 bg-gray-200 rounded animate-pulse" />
              <div className="h-12 bg-gray-200 rounded animate-pulse w-3/4" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
              </div>
            </div>

            {/* Skeleton da imagem */}
            <div className="lg:col-span-1 flex justify-center">
              <div className="aspect-[3/2] w-full max-w-[600px] bg-gray-200 animate-pulse rounded-lg shadow-lg" />
            </div>

            {/* Skeleton dos benefícios */}
            <div className="lg:col-span-1 space-y-6">
              {Array.from({ length: 3 }).map((_, benefitIndex) => (
                <div key={benefitIndex} className="space-y-2">
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-2/3" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
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
            message="Erro ao carregar dados"
            icon="AlertCircle"
            className="mx-auto mb-6"
          />
          <p className="text-gray-600 mb-4 max-w-md mx-auto">
            Não foi possível carregar as informações.
          </p>
          <ButtonCustom onClick={refetch} variant="default" icon="RefreshCw">
            Tentar Novamente
          </ButtonCustom>
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
    </div>
  );
};

export default AdvanceAjuda;
