// src/theme/website/components/about-advantages/AboutAdvantages.tsx

"use client";

import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { WhyChooseSection } from "./components/WhyChooseSection";
import { AboutSection } from "./components/AboutSection";
import { useAboutAdvantagesData } from "./hooks/useAboutAdvantagesData";
import { ImageNotFound } from "@/components/ui/custom/image-not-found";
import { ButtonCustom } from "@/components/ui/custom/button";
import type { AboutAdvantagesProps } from "./types";
import { env } from "@/lib/env";
import { Loader } from "@/components/ui/custom/loader";

const AboutAdvantages: React.FC<AboutAdvantagesProps> = ({
  className,
  fetchFromApi = true,
  staticData,
  showWhyChoose = true,
  showAboutSection = true,
  onDataLoaded,
  onError,
}) => {
  const { data, isLoading, error, refetch } = useAboutAdvantagesData(
    fetchFromApi,
    staticData
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

  // Estado de carregamento
  if (isLoading) {
    if (env.apiFallback === "loading") {
      return (
        <div className={cn("py-16 flex justify-center", className)}>
          <Loader />
        </div>
      );
    }

    return (
      <div className={cn("py-8", className)}>
        {/* Loading da seção Why Choose */}
        <section className="aboutAdvantagesPx py-16">
          <div className="container mx-auto flex flex-col lg:flex-row items-center gap-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-gray-200 rounded-lg p-6 animate-pulse"
                >
                  <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4" />
                  <div className="h-4 bg-gray-300 rounded mb-2" />
                  <div className="h-3 bg-gray-300 rounded w-3/4 mx-auto" />
                </div>
              ))}
            </div>
            <div className="flex-1 space-y-4">
              <div className="h-8 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
              <div className="h-12 bg-gray-200 rounded animate-pulse w-48" />
            </div>
          </div>
        </section>

        {/* Loading da seção About */}
        <section className="aboutAdvantagesPx py-6">
          <div className="container mx-auto">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="w-full lg:w-1/2 space-y-4">
                <div className="h-8 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
              </div>
              <div className="w-full lg:w-1/2">
                <div className="aspect-[530/360] bg-gray-200 animate-pulse rounded-lg" />
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Estado de erro
  if (error && env.apiFallback !== "mock") {
    return (
      <div className={cn("py-16", className)}>
        <div className="container mx-auto px-4 text-center">
          <ImageNotFound
            size="lg"
            variant="error"
            message="Erro ao carregar informações"
            icon="AlertCircle"
            className="mx-auto mb-6"
          />
          <p className="text-gray-600 mb-4 max-w-md mx-auto">
            Não foi possível carregar as informações sobre a empresa.
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
    <div className={cn(className)}>
      {/* Seção Por que escolher */}
      {showWhyChoose && data.whyChoose.isActive && (
        <WhyChooseSection data={data.whyChoose} cards={data.advantageCards} />
      )}

      {/* Seção Sobre */}
      {showAboutSection && data.aboutSection.isActive && (
        <AboutSection data={data.aboutSection} />
      )}

      {/* Indicador de erro sutil */}
      {error && (
        <div className="text-center py-2">
          <span className="text-xs text-gray-500">Dados de exemplo</span>
        </div>
      )}
    </div>
  );
};

export default AboutAdvantages;
