"use client";

import React, { useEffect, useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import Slider from "@/theme/website/components/slider";
import AboutSection from "@/theme/website/components/about";
import BannersGroup from "@/theme/website/components/banners";
import CounterInformation from "@/theme/website/components/counter-information";
import BusinessGroupInformation from "@/theme/website/components/business-group-information";
import CoursesCarousel from "@/theme/website/components/courses-carousel";

/**
 * Página Inicial do Website Institucional
 *
 * Esta é a homepage que representa a AdvanceMais como empresa
 * e apresenta seus serviços, cursos e soluções.
 */
export default function WebsiteHomePage() {
  const [isClient, setIsClient] = useState(false);

  // Configura o título da página
  usePageTitle("Página Inicial");

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
      {/* Hero Slider - Banner principal */}
      <Slider />

      {/* Seção Sobre a Empresa */}
      <AboutSection />

      {/* Banners de Destaque */}
      <BannersGroup />

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

      {/* ============================================= */}
      {/* SEÇÕES DE NEGÓCIO - OPÇÃO 1: Com dados padrão (SEM API) */}
      {/* ============================================= */}
      <BusinessGroupInformation
        fetchFromApi={false}
        onDataLoaded={(data) => {
          console.log("Seções de negócio carregadas:", data);
        }}
        onError={(error) => {
          console.warn("Erro ao carregar seções:", error);
        }}
      />

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
          console.warn("Erro ao carregar seções da API:", error);
        }}
      />
      */}

      {/* ============================================= */}
      {/* CURSOS CAROUSEL - OPÇÃO 1: Com dados padrão (SEM API) */}
      {/* ============================================= */}
      <CoursesCarousel
        fetchFromApi={false}
        title="Cursos em destaque"
        buttonText="Ver todos os cursos"
        buttonUrl="/cursos"
        onDataLoaded={(data) => {
          console.log("Cursos carregados:", data);
        }}
        onError={(error) => {
          console.warn("Erro ao carregar cursos:", error);
        }}
      />

      {/* 
      ============================================= 
      CURSOS CAROUSEL - OPÇÃO 2: Com API (quando estiver pronta)
      =============================================
      <CoursesCarousel
        fetchFromApi={true}
        title="Cursos em destaque"
        buttonText="Ver todos os cursos"
        buttonUrl="/cursos"
        onDataLoaded={(data) => {
          console.log("Cursos carregados da API:", data);
        }}
        onError={(error) => {
          console.warn("Erro ao carregar cursos da API:", error);
        }}
      />
      */}

      {/* 
      ============================================= 
      CURSOS CAROUSEL - OPÇÃO 3: Com dados customizados
      =============================================
      <CoursesCarousel
        fetchFromApi={false}
        staticData={[
          {
            id: 1,
            image: '/images/custom-course.jpg',
            title: 'Meu Curso Customizado',
            tag: 'Exclusivo',
            description: 'Descrição do curso customizado',
            duration: '20h',
            price: 199,
            instructor: 'Instrutor Custom',
            url: '/curso-custom',
            category: 'Custom',
            isActive: true,
            order: 1,
            isFeatured: true,
          },
        ]}
        title="Cursos Especiais"
        buttonText="Ver cursos especiais"
        buttonUrl="/cursos-especiais"
      />
      */}
    </div>
  );
}
