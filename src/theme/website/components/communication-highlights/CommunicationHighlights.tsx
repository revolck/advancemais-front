// src/theme/website/components/communication-highlights/CommunicationHighlights.tsx

"use client";

import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { TextContent } from "./components/TextContent";
import { ImageGallery } from "./components/ImageGallery";
import { useCommunicationData } from "./hooks/useCommunicationData";
import { ImageNotFound } from "@/components/ui/custom/image-not-found";
import { ButtonCustom } from "@/components/ui/custom/button";
import type { CommunicationHighlightsProps } from "./types";

/**
 * Componente CommunicationHighlights
 * Exibe uma seção sobre comunicação com texto e galeria de imagens
 *
 * @example
 * ```tsx
 * // Uso básico com dados da API
 * <CommunicationHighlights />
 *
 * // Com dados estáticos
 * <CommunicationHighlights
 *   fetchFromApi={false}
 *   staticData={myCommunicationData}
 * />
 * ```
 */
const CommunicationHighlights: React.FC<CommunicationHighlightsProps> = ({
  className,
  fetchFromApi = true,
  staticData,
  onDataLoaded,
  onError,
}) => {
  const { data, isLoading, error, refetch } = useCommunicationData(
    fetchFromApi,
    staticData
  );

  // Callbacks quando dados são carregados ou há erro
  useEffect(() => {
    if (data && !isLoading) {
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
      <section
        className={cn(
          "pxResponsive container mx-auto py-16 flex flex-col lg:flex-row items-center gap-8",
          className
        )}
      >
        {/* Skeleton do texto */}
        <div className="lg:w-1/2 w-full space-y-6">
          <div className="h-10 bg-gray-200 rounded animate-pulse mb-6" />
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
          </div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
          </div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-4/5" />
          </div>
        </div>

        {/* Skeleton da galeria */}
        <div className="lg:w-1/2 w-full grid grid-cols-1 md:grid-cols-2 gap-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="aspect-[4/3] bg-gray-200 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </section>
    );
  }

  // Estado de erro (com opção de retry)
  if (error && !data.textContent.title) {
    return (
      <section
        className={cn("pxResponsive container mx-auto py-16", className)}
      >
        <div className="text-center">
          <ImageNotFound
            size="lg"
            variant="error"
            message="Erro ao carregar seção de comunicação"
            icon="AlertCircle"
            className="mx-auto mb-6"
          />
          <p className="text-gray-600 mb-4 max-w-md mx-auto">
            Não foi possível carregar as informações de comunicação.
            {error.includes("padrão") ? " Exibindo dados de exemplo." : ""}
          </p>
          {!error.includes("padrão") && (
            <ButtonCustom onClick={refetch} variant="default" icon="RefreshCw">
              Tentar Novamente
            </ButtonCustom>
          )}
        </div>
      </section>
    );
  }

  // Estado normal com dados
  return (
    <section
      className={cn(
        "pxResponsive container mx-auto py-16 flex flex-col lg:flex-row items-center gap-8",
        className
      )}
    >
      {/* Seção de Texto */}
      <div className="lg:w-1/2 w-full">
        <div className="text-center lg:text-left">
          <TextContent content={data.textContent} />
        </div>
      </div>

      {/* Galeria de Imagens */}
      <div className="lg:w-1/2 w-full">
        <ImageGallery images={data.gallery} />
      </div>

      {/* Indicador de erro sutil se houver fallback */}
      {error && data.textContent.title && (
        <div className="absolute bottom-4 right-4 text-xs text-gray-500">
          Dados de exemplo
        </div>
      )}
    </section>
  );
};

export default CommunicationHighlights;
