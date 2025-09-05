"use client";

import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { LogoCard } from "./components/LogoCard";
import { useLogosData } from "./hooks/useLogosData";
import { ImageNotFound } from "@/components/ui/custom/image-not-found";
import { ButtonCustom } from "@/components/ui/custom/button";
import { DEFAULT_CONTENT } from "./constants";
import type { LogoEnterprisesProps, LogoData } from "./types";

const LogoEnterprises: React.FC<LogoEnterprisesProps> = ({
  className,
  title = DEFAULT_CONTENT.title,
  fetchFromApi = true,
  staticData,
  onDataLoaded,
  onError,
  onLogoClick,
}) => {
  const { data, isLoading, error, refetch } = useLogosData(
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

  // Handler para clique no logo
  const handleLogoClick = (logo: LogoData) => {
    if (logo.website) {
      window.open(logo.website, "_blank", "noopener,noreferrer");
    }
    onLogoClick?.(logo);
  };

  // Estado de carregamento
  if (isLoading) {
    return (
      <section className={cn("py-12 bg-white", className)}>
        <div className="container mx-auto text-center px-6">
          {/* Header Skeleton */}
          <div className="h-10 bg-gray-200 rounded animate-pulse w-96 mx-auto mb-4" />
          <div className="space-y-2 mb-8">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-full max-w-2xl mx-auto" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 max-w-xl mx-auto" />
          </div>

          {/* Logos Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className="flex justify-center items-center p-4 bg-gray-100 rounded-lg animate-pulse h-20"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Estado de erro
  if (error && (!data || data.length === 0)) {
    return (
      <section className={cn("py-12 bg-white", className)}>
        <div className="container mx-auto text-center px-6">
          <ImageNotFound
            size="lg"
            variant="error"
            message="Erro ao carregar logos das empresas"
            icon="Building2"
            className="mx-auto mb-6"
          />
          <p className="text-gray-600 mb-4 max-w-md mx-auto">
            Não foi possível carregar os logos das empresas parceiras.
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
    <section className={cn("py-12 mb-7", className)}>
      <div className="container mx-auto text-center px-6">
        {/* Título e subtítulo */}
        <h2 className="text-4xl font-bold text-[var(--primary-color)] mb-4">
          {title}
        </h2>

        {/* Grid de logos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          {data.map((logo, index) => (
            <div
              key={logo.id}
              style={{
                animationDelay: `${index * 50}ms`,
              }}
              className="animate-fade-in-up"
            >
              <LogoCard logo={logo} onLogoClick={handleLogoClick} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LogoEnterprises;
