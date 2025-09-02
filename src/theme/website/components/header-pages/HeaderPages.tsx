"use client";

import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { HeaderContent } from "./components/HeaderContent";
import { useHeaderData } from "./hooks/useHeaderData";
import { ImageNotFound } from "@/components/ui/custom/image-not-found";
import { ButtonCustom } from "@/components/ui/custom/button";
import type { HeaderPagesProps } from "./types";

const HeaderPages: React.FC<HeaderPagesProps> = ({
  className,
  fetchFromApi = true,
  staticData,
  currentPage,
  onDataLoaded,
  onError,
}) => {
  const { data, isLoading, error, refetch } = useHeaderData(
    fetchFromApi,
    staticData,
    currentPage
  );

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

  // Estado de carregamento - CORRIGIDO: Skeleton com tamanho fixo
  if (isLoading) {
    return (
      <div className={cn("py-8", className)}>
        <section className="header-pages-px-responsive container mx-auto py-16 flex flex-col lg:flex-row items-center gap-8">
          <div className="w-full flex flex-col lg:flex-row items-start justify-between">
            {/* Skeleton do texto */}
            <div className="text-center lg:text-left" style={{ width: "43%" }}>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-32 mb-1" />
              <div className="h-12 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="space-y-2 mb-6">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
              </div>
              <div className="h-12 bg-gray-200 rounded animate-pulse w-32" />
            </div>

            {/* Skeleton da imagem - Tamanho fixo 686x305 */}
            <div className="header-pages-container">
              <div
                className="bg-gray-200 rounded-lg animate-pulse"
                style={{
                  width: "686px",
                  height: "305px",
                }}
              />
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Estado de erro (com opção de retry)
  if (error && !data) {
    return (
      <div className={cn("py-16", className)}>
        <div className="container mx-auto px-4 text-center">
          <ImageNotFound
            size="lg"
            variant="error"
            message="Erro ao carregar header da página"
            icon="AlertCircle"
            className="mx-auto mb-6"
          />
          <p className="text-gray-600 mb-4 max-w-md mx-auto">
            Não foi possível carregar as informações do header.
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
  if (!data) {
    return null;
  }

  return (
    <div className={cn(className)}>
      <HeaderContent data={data} />
    </div>
  );
};

export default HeaderPages;
