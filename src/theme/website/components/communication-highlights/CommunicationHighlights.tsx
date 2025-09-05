"use client";

import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { TextContent } from "./components/TextContent";
import { ImageGallery } from "./components/ImageGallery";
import { useCommunicationData } from "./hooks/useCommunicationData";
import { ImageNotFound } from "@/components/ui/custom/image-not-found";
import { ButtonCustom } from "@/components/ui/custom/button";
import type { CommunicationHighlightsProps } from "./types";
import { Skeleton } from "@/components/ui/skeleton";

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
          "container mx-auto py-16 flex flex-col lg:flex-row items-center gap-8",
          className
        )}
      >
        {/* Skeleton do texto */}
        <div className="lg:w-1/2 w-full space-y-6">
          <Skeleton className="h-10 w-2/3 mb-6" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>

        {/* Skeleton da galeria */}
        <div className="lg:w-1/2 w-full grid grid-cols-1 md:grid-cols-2 gap-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="aspect-[4/3] w-full rounded-lg" />
          ))}
        </div>
      </section>
    );
  }

  // Estado de erro (com opção de retry)
  if (error && !data.textContent.title) {
    return (
      <section className={cn("container mx-auto py-16", className)}>
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
          </p>
          <ButtonCustom onClick={refetch} variant="default" icon="RefreshCw">
            Tentar Novamente
          </ButtonCustom>
        </div>
      </section>
    );
  }

  // Estado normal com dados
  return (
    <section
      className={cn(
        "container mx-auto py-16 flex flex-col lg:flex-row items-center gap-8",
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

      {/* Mensagem sutil quando houve erro mas conseguimos exibir algo */}
      {error && data.textContent.title && (
        <div className="absolute bottom-4 right-4 text-xs text-gray-500">
          Alguns dados podem estar indisponíveis
        </div>
      )}
    </section>
  );
};

export default CommunicationHighlights;
