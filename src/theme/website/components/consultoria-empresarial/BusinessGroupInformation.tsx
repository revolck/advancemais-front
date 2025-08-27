// src/theme/website/components/business-group-information/BusinessGroupInformation.tsx

"use client";

import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { ContentSection } from "./components/ContentSection";
import { useBusinessData } from "./hooks/useBusinessData";
import { ImageNotFound } from "@/components/ui/custom/image-not-found";
import { ButtonCustom } from "@/components/ui/custom/button";
import type { BusinessGroupInformationProps } from "./types";

/**
 * Componente BusinessGroupInformation
 * Exibe seções de negócio com imagem e texto alternados
 *
 * @example
 * ```tsx
 * // Uso básico com dados da API
 * <BusinessGroupInformation />
 *
 * // Com dados estáticos
 * <BusinessGroupInformation
 *   fetchFromApi={false}
 *   staticData={myBusinessData}
 * />
 * ```
 */
const BusinessGroupInformation: React.FC<BusinessGroupInformationProps> = ({
  className,
  fetchFromApi = true,
  staticData,
  onDataLoaded,
  onError,
}) => {
  const { data, isLoading, error, refetch } = useBusinessData(
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
        {Array.from({ length: 2 }).map((_, index) => (
          <section
            key={index}
            className={`container mx-auto pt-16 lg:pb-6 px-4 flex flex-col lg:flex-row items-center lg:gap-20 gap-6 mt-5 ${
              index % 2 === 1 ? "lg:flex-row-reverse" : ""
            }`}
          >
            {/* Skeleton da imagem */}
            <div className="w-full lg:w-1/2">
              <div className="aspect-[3/2] bg-gray-200 animate-pulse rounded-lg" />
            </div>

            {/* Skeleton do texto */}
            <div className="w-full lg:w-1/2 space-y-4">
              <div className="h-8 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
              </div>
              <div className="h-12 bg-gray-200 rounded animate-pulse w-32" />
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
            message="Erro ao carregar seções de negócio"
            icon="AlertCircle"
            className="mx-auto mb-6"
          />
          <p className="text-gray-600 mb-4 max-w-md mx-auto">
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
        <ContentSection key={item.id} data={item} index={index} />
      ))}
    </div>
  );
};

export default BusinessGroupInformation;
