// src/theme/website/components/process-steps/ProcessSteps.tsx

"use client";

import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { ProcessStepItem } from "./components/ProcessStepItem";
import { useProcessData } from "./hooks/useProcessData";
import { ImageNotFound } from "@/components/ui/custom/image-not-found";
import { ButtonCustom } from "@/components/ui/custom/button";
import { PROCESS_CONFIG } from "./constants";
import type { ProcessStepsProps } from "./types";

/**
 * Componente ProcessSteps
 * Exibe um processo em etapas numeradas com título e descrição
 *
 * @example
 * ```tsx
 * // Uso básico com dados da API
 * <ProcessSteps />
 *
 * // Com dados estáticos
 * <ProcessSteps
 *   fetchFromApi={false}
 *   staticData={myProcessData}
 * />
 * ```
 */
const ProcessSteps: React.FC<ProcessStepsProps> = ({
  className,
  fetchFromApi = true,
  staticData,
  onDataLoaded,
  onError,
}) => {
  const { data, isLoading, error, refetch } = useProcessData(
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
        className={cn("bg-[var(--primary-color)] py-20 text-white", className)}
      >
        <div className="container mx-auto px-4 w-[94%] grid lg:grid-cols-2 gap-16 items-center">
          {/* Skeleton do lado esquerdo */}
          <div className="text-center lg:text-left">
            <div className="h-6 bg-white/20 rounded mb-4 w-32 animate-pulse" />
            <div className="h-10 bg-white/30 rounded mb-6 w-64 animate-pulse" />
            <div className="h-20 bg-white/20 rounded animate-pulse" />
          </div>

          {/* Skeleton do lado direito */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-white/30 rounded-full mx-auto mb-4 animate-pulse" />
                <div className="h-6 bg-white/20 rounded mb-2 animate-pulse" />
                <div className="h-16 bg-white/10 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Estado de erro
  if (error && (!data || !data.steps || data.steps.length === 0)) {
    return (
      <section
        className={cn("bg-[var(--primary-color)] py-20 text-white", className)}
      >
        <div className="container mx-auto px-4 text-center">
          <ImageNotFound
            size="lg"
            variant="error"
            message="Erro ao carregar etapas do processo"
            icon="AlertCircle"
            className="mx-auto mb-6 bg-white/10 border-white/20"
          />
          <p className="text-white/80 mb-4 max-w-md mx-auto">
            Não foi possível carregar as etapas do processo.
            {error.includes("padrão") ? " Exibindo dados de exemplo." : ""}
          </p>
          {!error.includes("padrão") && (
            <ButtonCustom
              onClick={refetch}
              variant="secondary"
              icon="RefreshCw"
              className="bg-white/10 hover:bg-white/20 text-white border-white/30"
            >
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
      className={cn("bg-[var(--primary-color)] py-20 text-white", className)}
    >
      <div className="container mx-auto px-4 w-[94%] grid lg:grid-cols-2 gap-16 items-center relative z-10">
        {/* Lado esquerdo: Texto */}
        <div className="text-center lg:text-left">
          {/* Subtítulo */}
          <h3 className="text-lg uppercase text-[var(--secondary-color)] font-light mb-4 tracking-wide">
            {data.subtitle}
          </h3>

          {/* Título principal */}
          <h2 className="text-3xl lg:text-4xl font-extrabold mb-6 leading-tight">
            {data.title}
          </h2>

          {/* Descrição */}
          <p className="leading-relaxed mb-8 text-gray-300 text-base lg:text-lg max-w-lg lg:max-w-none">
            {data.description}
          </p>
        </div>

        {/* Lado direito: Etapas */}
        <div
          className={cn(
            "grid gap-8",
            // Responsivo baseado no número de etapas
            data.steps.length <= 2
              ? "grid-cols-1 md:grid-cols-2"
              : data.steps.length === 3
              ? "grid-cols-1 md:grid-cols-3"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          )}
        >
          {data.steps.map((step, index) => (
            <ProcessStepItem key={step.id} step={step} index={index} />
          ))}
        </div>
      </div>

      {/* Indicador de erro sutil se houver fallback */}
      {error && data.steps.length > 0 && (
        <div className="absolute bottom-4 right-4 text-xs text-white/50">
          Dados de exemplo
        </div>
      )}
    </section>
  );
};

export default ProcessSteps;
