// src/theme/website/components/problem-solution-section/ProblemSolutionSection.tsx

"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ProblemsList } from "./components/ProblemsList";
import { useProblemSolutionData } from "./hooks/useProblemSolutionData";
import { ImageNotFound } from "@/components/ui/custom/image-not-found";
import { ButtonCustom } from "@/components/ui/custom/button";
import { PROBLEM_SOLUTION_CONFIG } from "./constants";
import type { ProblemSolutionSectionProps } from "./types";

/**
 * Componente ProblemSolutionSection
 * Exibe uma seção com título/descrição à esquerda e cards de problemas à direita
 *
 * @example
 * ```tsx
 * // Uso básico com dados da API
 * <ProblemSolutionSection />
 *
 * // Com dados estáticos
 * <ProblemSolutionSection
 *   fetchFromApi={false}
 *   staticData={myData}
 * />
 * ```
 */
const ProblemSolutionSection: React.FC<ProblemSolutionSectionProps> = ({
  className,
  fetchFromApi = true,
  staticData,
  onDataLoaded,
  onError,
}) => {
  const { data, isLoading, error, refetch } = useProblemSolutionData(
    fetchFromApi,
    staticData
  );
  const [imageLoading, setImageLoading] = useState(!!data.imageUrl);
  const [imageError, setImageError] = useState(false);

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

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  // Estado de carregamento
  if (isLoading) {
    return (
      <section
        className={cn("pxResponsive container mx-auto py-14", className)}
      >
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Skeleton do texto */}
          <div className="lg:w-1/2 space-y-6">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3" />
            </div>
          </div>

          {/* Skeleton dos cards */}
          <div className="lg:w-1/2 flex flex-col gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="flex items-start gap-6 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
              >
                <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Estado de erro (com opção de retry)
  if (error && (!data || !data.problems.length)) {
    return (
      <section
        className={cn("pxResponsive container mx-auto py-14", className)}
      >
        <div className="text-center">
          <ImageNotFound
            size="lg"
            variant="error"
            message="Erro ao carregar conteúdo"
            icon="AlertCircle"
            className="mx-auto mb-6"
          />
          <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto">
            Não foi possível carregar as informações.
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
        "pxResponsive container mx-auto py-14 flex flex-col lg:flex-row items-center gap-16",
        className
      )}
    >
      {/* Texto no lado esquerdo */}
      <div className="lg:w-1/2 text-center lg:text-left">
        <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-8 leading-tight">
          {data.mainTitle}
        </h2>

        <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-8 text-justify lg:text-left">
          {data.mainDescription}
        </p>

        {/* Imagem opcional */}
        {data.imageUrl && (
          <div className="mt-8 lg:hidden">
            {/* Loading State */}
            {imageLoading && (
              <div className="aspect-video bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {/* Error State */}
            {imageError && (
              <ImageNotFound
                size="full"
                variant="muted"
                aspectRatio="video"
                message="Imagem indisponível"
                icon="ImageOff"
                className="aspect-video rounded-lg"
                showMessage={true}
              />
            )}

            {/* Main Image */}
            {!imageError && (
              <Image
                src={data.imageUrl}
                alt={data.imageAlt || "Imagem ilustrativa"}
                width={600}
                height={400}
                className={`
                  rounded-lg object-cover w-full
                  transition-opacity duration-500
                  ${imageLoading ? "opacity-0 absolute inset-0" : "opacity-100"}
                `}
                style={{ aspectRatio: "3/2" }}
                onLoad={handleImageLoad}
                onError={handleImageError}
                quality={PROBLEM_SOLUTION_CONFIG.image.quality}
                sizes={PROBLEM_SOLUTION_CONFIG.image.sizes}
              />
            )}
          </div>
        )}
      </div>

      {/* Cards no lado direito */}
      <div className="lg:w-1/2">
        <ProblemsList problems={data.problems} />
      </div>

      {/* Indicador de erro sutil se houver fallback */}
      {error && data.problems.length > 0 && (
        <div className="absolute bottom-2 right-4 text-xs text-gray-500">
          Dados de exemplo
        </div>
      )}
    </section>
  );
};

export default ProblemSolutionSection;
