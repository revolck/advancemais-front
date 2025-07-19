// src/theme/website/components/counter-information/CounterInformation.tsx

"use client";

import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { CounterItem } from "./components/CounterItem";
import { useCounterData } from "./hooks/useCounterData";
import { ImageNotFound } from "@/components/ui/custom/image-not-found";
import { ButtonCustom } from "@/components/ui/custom/button";
import { COUNTER_CONFIG } from "./constants";
import type { CounterInformationProps } from "./types";

const CounterInformation: React.FC<CounterInformationProps> = ({
  className,
  animated = true,
  animationDuration = COUNTER_CONFIG.animation.defaultDuration,
  fetchFromApi = true,
  staticData,
  onDataLoaded,
  onError,
}) => {
  const { data, isLoading, error, refetch } = useCounterData(
    fetchFromApi,
    staticData
  );

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
      <section
        className={cn(
          "bg-[var(--primary-color)] py-16 md:py-20 lg:py-24 relative overflow-hidden",
          className
        )}
      >
        <div className="container mx-auto px-4 flex flex-wrap justify-center md:justify-between items-center gap-8 md:gap-6 lg:gap-8 max-w-6xl">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="text-center flex-1 min-w-[180px] md:min-w-[200px] flex flex-col gap-2"
            >
              <div className="h-4 bg-white/20 rounded mb-3 w-20 mx-auto animate-pulse" />
              <div className="h-16 sm:h-20 md:h-24 bg-white/30 rounded mb-3 w-32 mx-auto animate-pulse" />
              <div className="h-6 bg-white/20 rounded w-24 mx-auto animate-pulse" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Estado de erro
  if (error && (!data || data.length === 0)) {
    return (
      <section
        className={cn(
          "bg-[var(--primary-color)] py-16 md:py-20 lg:py-24 relative overflow-hidden",
          className
        )}
      >
        <div className="container mx-auto px-4 text-center">
          <ImageNotFound
            size="lg"
            variant="error"
            message="Erro ao carregar estatísticas"
            icon="AlertCircle"
            className="mx-auto mb-6 bg-white/10 border-white/20"
          />
          <p className="text-white/80 mb-4 max-w-md mx-auto">
            Não foi possível carregar as estatísticas.
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
      className={cn(
        "bg-[var(--primary-color)] py-16 md:py-20 lg:py-24 relative overflow-hidden",
        className
      )}
    >
      <div className="container mx-auto px-4 flex flex-wrap justify-center md:justify-between items-center gap-8 md:gap-6 lg:gap-8 relative z-10">
        {data.map((item, index) => (
          <CounterItem
            key={item.id}
            data={item}
            animated={animated}
            animationDuration={animationDuration}
            index={index}
          />
        ))}
      </div>
    </section>
  );
};

export default CounterInformation;
