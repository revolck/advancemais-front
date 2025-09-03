"use client";

import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { AccordionSection } from "./components/AccordionSection";
import { useAccordionData } from "./hooks/useAccordionData";
import { ImageNotFound } from "@/components/ui/custom/image-not-found";
import { ButtonCustom } from "@/components/ui/custom/button";
import type { AccordionGroupInformationProps } from "./types";

const AccordionGroupInformation: React.FC<AccordionGroupInformationProps> = ({
  className,
  fetchFromApi = true,
  staticData,
  onDataLoaded,
  onError,
}) => {
  const { data, isLoading, error, refetch } = useAccordionData(
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

  // Estado de carregamento com placeholder de vídeo à direita
  if (isLoading) {
    return (
      <div className={cn("py-8", className)}>
        {Array.from({ length: 1 }).map((_, index) => (
          <section key={index} className="py-16 lg:py-20 bg-white">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-16 max-w-7xl mx-auto">
                {/* Skeleton do texto e accordion (esquerda) */}
                <div className="w-full lg:w-1/2 flex flex-col justify-start space-y-6">
                  <div className="h-10 bg-gray-200 rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
                  <div className="space-y-4 pt-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-16 bg-gray-200 rounded-xl animate-pulse"
                      />
                    ))}
                  </div>
                </div>

                {/* Skeleton do vídeo (direita) */}
                <div className="w-full lg:w-1/2">
                  <div className="aspect-video bg-gray-200 rounded-2xl animate-pulse" />
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>
    );
  }

  // Estado de erro
  if (error && (!data || data.length === 0)) {
    return (
      <div className={cn("py-16", className)}>
        <div className="container mx-auto px-4 text-center">
          <ImageNotFound
            size="lg"
            variant="error"
            message="Erro ao carregar seções de accordion"
            icon="AlertCircle"
            className="mx-auto mb-6"
          />
          <p className="text-gray-600 mb-4 max-w-md mx-auto">
            Não foi possível carregar as informações dos accordions.
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
        <AccordionSection key={item.id} data={item} index={index} />
      ))}
    </div>
  );
};

export default AccordionGroupInformation;
