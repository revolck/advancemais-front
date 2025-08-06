"use client";

import React, { useEffect, useCallback } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import Slider from "@/theme/website/components/slider";
import AboutSection from "@/theme/website/components/about";
import BannersGroup from "@/theme/website/components/banners";
import CounterInformation from "@/theme/website/components/counter-information";
import BusinessGroupInformation from "@/theme/website/components/business-group-information";
import CoursesCarousel from "@/theme/website/components/courses-carousel";
import BlogSection from "@/theme/website/components/blog-section";
import LogoEnterprises from "@/theme/website/components/logo-enterprises";
import { useWebsiteLoading } from "./loading-context";

/**
 * Página Inicial do Website Institucional
 *
 * Esta é a homepage que representa a AdvanceMais como empresa
 * e apresenta seus serviços, cursos e soluções.
 */
export default function WebsiteHomePage() {
  const { register, init } = useWebsiteLoading();

  // Configura o título da página
  usePageTitle("Página Inicial");

  useEffect(() => {
    init(6);
  }, [init]);

  const handleSectionLoaded = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_?: unknown) => {
      register();
    },
    [register]
  );

  return (
    <div className="min-h-screen">
      {/* Hero Slider - Banner principal */}
      <Slider />
      {/* Seção Sobre a Empresa */}
      <AboutSection
        onDataLoaded={handleSectionLoaded}
        onError={handleSectionLoaded}
      />
      {/* Banners de Destaque */}
      <BannersGroup />
      {/* ============================================= */}
      {/* CONTADORES - OPÇÃO 1: Com dados padrão (SEM API) */}
      {/* ============================================= */}
      <CounterInformation
        fetchFromApi={false}
        animated={true}
        animationDuration={1200}
        onDataLoaded={handleSectionLoaded}
        onError={handleSectionLoaded}
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
        onDataLoaded={handleSectionLoaded}
        onError={handleSectionLoaded}
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
        onDataLoaded={handleSectionLoaded}
        onError={handleSectionLoaded}
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
      {/* ================================ */}
      {/* BLOG: Com dados padrão (SEM API) */}
      {/* ================================ */}
      <BlogSection
        fetchFromApi={false}
        title="Últimas Notícias"
        buttonText="Ver todas"
        onDataLoaded={handleSectionLoaded}
        onError={handleSectionLoaded}
      />
      {/* // Com configurações customizadas
      <BlogSection
        maxPostsDesktop={6}
        maxPostsMobile={3}
        onPostClick={(post) => console.log("Post clicado:", post)}
      /> */}

      {/* ============================================= */}
      {/* Logos Enterprises: Com dados padrão (SEM API) */}
      {/* ============================================= */}
      <LogoEnterprises
        fetchFromApi={false}
        title="Quem está com a gente nessa jornada"
        onDataLoaded={handleSectionLoaded}
        onError={handleSectionLoaded}
      />
    </div>
  );
}
