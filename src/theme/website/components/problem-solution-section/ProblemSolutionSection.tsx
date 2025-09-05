"use client";

import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { ProblemsList } from "./components/ProblemsList";
import { useProblemSolutionData } from "./hooks/useProblemSolutionData";
import { ImageNotFound } from "@/components/ui/custom/image-not-found";
import { ButtonCustom } from "@/components/ui/custom/button";
import type { ProblemSolutionSectionProps } from "./types";

const EMPTY_STATE = {
  icon: "FileSpreadsheet",
  title: "Sem conteúdos de Planilhas publicados",
  message: "Cadastre em Website → Planinhas no painel para aparecer aqui.",
  buttonLabel: "Recarregar",
} as const;

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
    const skeletonCards = 3;
    return (
      <section
        className={cn("container mx-auto py-14", className)}
      >
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Skeleton do texto */}
          <div className="lg:w-1/2 space-y-6">
            <div className="h-12 bg-gray-200 rounded animate-pulse" />
            <div className="h-12 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
            </div>
          </div>

          {/* Skeleton dos cards */}
          <div className="lg:w-1/2 flex flex-col gap-6">
            {Array.from({ length: skeletonCards }).map((_, index) => (
              <div
                key={index}
                className="flex items-start gap-6 p-6 bg-gray-100 rounded-lg animate-pulse"
              >
                <div className="w-14 h-14 bg-gray-200 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-6 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
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
        className={cn("container mx-auto py-14", className)}
      >
        <div className="text-center">
          <ImageNotFound
            size="lg"
            variant="error"
            message="Erro ao carregar conteúdo"
            icon="AlertCircle"
            className="mx-auto mb-6"
          />
          <p className="text-gray-600 mb-4 max-w-md mx-auto">
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

  // Estado vazio (sem dados após carregamento bem-sucedido)
  const noTitle = !data?.mainTitle || data.mainTitle.trim().length === 0;
  const noDescription =
    !data?.mainDescription || data.mainDescription.trim().length === 0;
  const noProblems = !data?.problems || data.problems.length === 0;

  if (!isLoading && noTitle && noDescription && noProblems) {
    const { icon, title, message, buttonLabel } = EMPTY_STATE;
    return (
      <section
        className={cn("container mx-auto py-14", className)}
      >
        <div className="flex flex-col items-center justify-center text-center gap-4 py-10">
          <ImageNotFound
            size="lg"
            variant="muted"
            icon={icon}
            message={title}
            className="mx-auto"
          />
          {message && <p className="text-gray-600 max-w-md">{message}</p>}
          <div className="mt-2">
            <ButtonCustom onClick={refetch} variant="default" icon="RefreshCw">
              {buttonLabel || "Recarregar"}
            </ButtonCustom>
          </div>
        </div>
      </section>
    );
  }

  // Estado normal com dados
  return (
    <section
      className={cn(
        "container mx-auto py-14 flex flex-col lg:flex-row items-center gap-16",
        className
      )}
    >
      {/* Texto no lado esquerdo */}
      <div className="lg:w-1/2 text-center lg:text-left">
        <h2 className="text-3xl sm:text-4xl xl:text-5xl font-bold text-[var(--primary-color)] mb-3 sm:mb-4 leading-tight text-center lg:text-left">
          {data.mainTitle}
        </h2>

        <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-6 sm:mb-8 text-center lg:text-left">
          {data.mainDescription}
        </p>

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
