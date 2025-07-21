// src/theme/website/components/training-results/TrainingResults.tsx

"use client";

import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { TrainingResultCard } from "./components/TrainingResultCard";
import { useTrainingData } from "./hooks/useTrainingData";
import { ImageNotFound } from "@/components/ui/custom/image-not-found";
import { ButtonCustom } from "@/components/ui/custom/button";
import { TRAINING_RESULTS_CONFIG } from "./constants";
import type { TrainingResultsProps } from "./types";

/**
 * Componente TrainingResults
 * Exibe os resultados/benefícios do treinamento in company
 *
 * @example
 * ```tsx
 * // Uso básico com dados da API
 * <TrainingResults />
 *
 * // Com título customizado
 * <TrainingResults
 *   title="NOSSO TREINAMENTO"
 *   highlightedText="PREMIUM"
 * />
 *
 * // Com dados estáticos
 * <TrainingResults
 *   fetchFromApi={false}
 *   staticData={myTrainingData}
 * />
 * ```
 */
const TrainingResults: React.FC<TrainingResultsProps> = ({
  className,
  title = TRAINING_RESULTS_CONFIG.defaultTitle,
  highlightedText = TRAINING_RESULTS_CONFIG.defaultHighlight,
  fetchFromApi = true,
  staticData,
  onDataLoaded,
  onError,
}) => {
  const { data, isLoading, error, refetch } = useTrainingData(
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
      <section className={cn("container mx-auto py-16 text-center", className)}>
        {/* Skeleton do título */}
        <div className="mb-12">
          <div className="h-8 bg-gray-200 rounded w-96 mx-auto animate-pulse mb-2" />
          <div className="h-8 bg-gray-200 rounded w-48 mx-auto animate-pulse" />
        </div>

        {/* Skeleton dos cards */}
        <div
          className={cn(
            "grid gap-8",
            TRAINING_RESULTS_CONFIG.grid.mobile,
            TRAINING_RESULTS_CONFIG.grid.tablet,
            TRAINING_RESULTS_CONFIG.grid.desktop
          )}
        >
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center bg-gray-100 rounded-xl p-6 shadow-md min-h-[180px]"
            >
              <div className="w-10 h-10 bg-gray-200 rounded mb-4 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Estado de erro
  if (error && (!data || data.length === 0)) {
    return (
      <section className={cn("container mx-auto py-16 text-center", className)}>
        <ImageNotFound
          size="lg"
          variant="error"
          message="Erro ao carregar resultados do treinamento"
          icon="AlertCircle"
          className="mx-auto mb-6"
        />
        <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto">
          Não foi possível carregar os resultados do treinamento.
          {error.includes("padrão") ? " Exibindo dados de exemplo." : ""}
        </p>
        {!error.includes("padrão") && (
          <ButtonCustom onClick={refetch} variant="default" icon="RefreshCw">
            Tentar Novamente
          </ButtonCustom>
        )}
      </section>
    );
  }

  // Estado normal com dados
  return (
    <section className={cn("container mx-auto py-16 text-center", className)}>
      {/* Título da seção */}
      <h2 className="text-4xl font-extrabold text-gray-800 mb-12 leading-tight">
        {title} <span className="text-red-600">{highlightedText}</span>{" "}
        {TRAINING_RESULTS_CONFIG.defaultSuffix}
      </h2>

      {/* Grid de resultados */}
      <div
        className={cn(
          "grid gap-8",
          TRAINING_RESULTS_CONFIG.grid.mobile,
          TRAINING_RESULTS_CONFIG.grid.tablet,
          TRAINING_RESULTS_CONFIG.grid.desktop
        )}
      >
        {data.map((item, index) => (
          <TrainingResultCard key={item.id} data={item} index={index} />
        ))}
      </div>

      {/* Indicador de erro sutil se houver fallback */}
      {error && data.length > 0 && (
        <div className="mt-8">
          <span className="text-xs text-gray-500">Dados de exemplo</span>
        </div>
      )}
    </section>
  );
};

export default TrainingResults;
