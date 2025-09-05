"use client";

import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { TrainingResultCard } from "./components/TrainingResultCard";
import { useTrainingData } from "./hooks/useTrainingData";
import { ImageNotFound } from "@/components/ui/custom/image-not-found";
import { ButtonCustom } from "@/components/ui/custom/button";
import { TRAINING_RESULTS_CONFIG } from "./constants";
import type { TrainingResultsProps } from "./types";
import { Skeleton } from "@/components/ui/skeleton";

const TrainingResults: React.FC<TrainingResultsProps> = ({
  className,
  title,
  highlightedText = TRAINING_RESULTS_CONFIG.defaultHighlight,
  fetchFromApi = true,
  staticData,
  onDataLoaded,
  onError,
}) => {
  const { data, isLoading, error, refetch, sectionTitle } = useTrainingData(
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

  // Define título efetivo: prop > API > default
  const effectiveTitle =
    title ?? sectionTitle ?? TRAINING_RESULTS_CONFIG.defaultTitle;

  // Estado de carregamento
  if (isLoading) {
    return (
      <section className={cn("container mx-auto py-16 text-center", className)}>
        {/* Skeleton do título */}
        <div className="mb-12 flex flex-col items-center gap-2">
          <Skeleton className="h-8 w-96" />
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
              <Skeleton className="w-10 h-10 mb-4 rounded" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
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
        <p className="text-gray-600 mb-4 max-w-md mx-auto">
          Não foi possível carregar os resultados do treinamento.
        </p>
        {
          <ButtonCustom onClick={refetch} variant="default" icon="RefreshCw">
            Tentar Novamente
          </ButtonCustom>
        }
      </section>
    );
  }

  // Estado normal com dados
  return (
    <section className={cn("container mx-auto py-16 text-center", className)}>
      <h2 className="!text-4xl font-bold text-[var(--primary-color)] !mb-12 ">
        {effectiveTitle}
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

      {/* Erro sutil, sem fallback mockado */}
      {error && data.length > 0 && (
        <div className="mt-8">
          <span className="text-xs text-gray-500">
            Alguns dados podem estar indisponíveis
          </span>
        </div>
      )}
    </section>
  );
};

export default TrainingResults;
