"use client";

import React, { useEffect, useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import HeaderPages from "@/theme/website/components/header-pages";
import type { HeaderPageData } from "@/theme/website/components/header-pages/types";
import CounterInformation from "@/theme/website/components/counter-information";
import AccordionGroupInformation from "@/theme/website/components/accordion-group-information";
import AboutAdvantages from "@/theme/website/components/about-advantages";
import LogoEnterprises from "@/theme/website/components/logo-enterprises";
import TestimonialsCarousel from "@/theme/website/components/testimonials-carousel";
import TeamShowcase from "@/theme/website/components/team-showcase";

/**
 * Página Sobre Nós
 *
 * Apresenta informações sobre a empresa, história, missão e valores
 */
export default function SobrePage() {
  const [isClient, setIsClient] = useState(false);

  // Configura o título da página
  usePageTitle("Sobre nós");

  // Dados mockados específicos para esta página
  const headerData: HeaderPageData = {
    id: "sobre-custom",
    title: "Sobre a Advance+",
    subtitle: "Nossa História",
    description:
      "Conheça nossa trajetória, missão e valores. Há mais de 10 anos transformando empresas e desenvolvendo talentos com soluções inovadoras e personalizadas.",
    buttonText: "Nossa equipe",
    buttonUrl: "/sobre/equipe",
    imageUrl: "/images/headers/sobre-header.webp",
    imageAlt: "Sobre a Advance+ - Nossa História",
    isActive: true,
    targetPages: ["/sobre"],
  };

  // Evita problemas de hidratação
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen">
        {/* Loading placeholder que é igual ao conteúdo */}
        <section className="relative min-h-[300px] bg-gray-100">
          <div className="flex items-center justify-center h-[300px]">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-36"></div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* ============================================= */}
      {/* HEADER DA PÁGINA - VERSÃO COM DADOS MOCKADOS */}
      {/* ============================================= */}
      <HeaderPages
        fetchFromApi={false}
        staticData={headerData}
        onDataLoaded={(data) => {
          console.log("Header da página 'sobre' carregado (mockado):", data);
        }}
        onError={(error) => {
          console.warn(
            "Erro ao carregar header (não deveria acontecer com dados mockados):",
            error
          );
        }}
      />
      {/* 
      ============================================= 
      HEADER DA PÁGINA - VERSÃO COM API (quando estiver pronta)
      =============================================
      <HeaderPages
        fetchFromApi={true}
        onDataLoaded={(data) => {
          console.log("Header da página 'sobre' carregado da API:", data);
        }}
        onError={(error) => {
          console.warn("Erro ao carregar header da API:", error);
        }}
      />
      */}
      {/* ============================================= */}
      {/* CONTADORES - OPÇÃO 1: Com dados padrão (SEM API) */}
      {/* ============================================= */}
      <CounterInformation
        fetchFromApi={false}
        animated={true}
        animationDuration={1200}
        onDataLoaded={(data) => {
          console.log("Estatísticas carregadas:", data);
        }}
        onError={(error) => {
          console.warn("Erro ao carregar estatísticas:", error);
        }}
      />
      {/* 
      ============================================= 
      CONTADORES - OPÇÃO 2: Com API (quando estiver pronta)
      =============================================
      <CounterInformation
        fetchFromApi={true}
        animated={true}
        animationDuration={1200}
        onDataLoaded={(data) => {
          console.log("Estatísticas carregadas da API:", data);
        }}
        onError={(error) => {
          console.warn("Erro ao carregar estatísticas da API:", error);
        }}
      />
      */}
      {/* 
      ============================================= 
      SEÇÕES DE NEGÓCIO - OPÇÃO 2: Com API (quando estiver pronta)
      =============================================
      <BusinessGroupInformation
        fetchFromApi={true}
        onDataLoaded={(data) => {
          console.log("Seções de negócio carregadas da API:", data);
        }}
        onError={(error) => {
          console.warn("Erro ao carregar seções de negócio da API:", error);
        }}
      />
      */}
      {/* ============================================= */}
      {/* ACCORDION SEÇÕES - OPÇÃO 1: Com dados padrão (SEM API) */}
      {/* ============================================= */}
      <AccordionGroupInformation
        fetchFromApi={false}
        onDataLoaded={(data) => {
          console.log("Seções de accordion carregadas:", data);
        }}
        onError={(error) => {
          console.warn("Erro ao carregar seções de accordion:", error);
        }}
      />
      <AboutAdvantages
        fetchFromApi={false}
        onDataLoaded={(data) => {
          console.log("About advantages carregado:", data);
        }}
      />
      {/* ============================================= */}
      {/* Logos Enterprises: Com dados padrão (SEM API) */}
      {/* ============================================= */}
      <LogoEnterprises
        fetchFromApi={false}
        title="Quem está com a gente nessa jornada"
      />

      <TeamShowcase title="Conheça nossa Equipe" fetchFromApi={false} />

      <TestimonialsCarousel
        fetchFromApi={false}
        onDataLoaded={(data) => {
          console.log("Depoimentos carregados:", data);
        }}
      />
    </div>
  );
}
