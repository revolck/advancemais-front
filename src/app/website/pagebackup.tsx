"use client";

import React from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import Slider from "@/theme/website/components/slider";
import AboutSection from "@/theme/website/components/about";
import BannersGroup from "@/theme/website/components/banners";
import CounterInformation from "@/theme/website/components/counter-information";
import BusinessGroupInformation from "@/theme/website/components/business-group-information";
import CoursesCarousel from "@/theme/website/components/courses-carousel";
import BlogSection from "@/theme/website/components/blog-section";
import LogoEnterprises from "@/theme/website/components/logo-enterprises";

/**
 * Página Inicial do Website Institucional
 *
 * Esta é a homepage que representa a AdvanceMais como empresa
 * e apresenta seus serviços, cursos e soluções.
 */
export default function WebsiteHomePage() {
  // Configura o título da página
  usePageTitle("Página Inicial");

  const handleComponentLoaded = (componentName: string) => {
    console.log(`✅ Componente carregado: ${componentName}`);
  };

  const handleComponentError = (componentName: string, error: string) => {
    console.warn(`⚠️ Erro no componente ${componentName}:`, error);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Slider - Banner principal */}
      <Slider />

      {/* Seção Sobre a Empresa */}
      <AboutSection
        onDataLoaded={() => handleComponentLoaded("About")}
        onError={(error) => handleComponentError("About", error)}
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
        onDataLoaded={(data) => {
          handleComponentLoaded("Counter");
          console.log("Estatísticas carregadas:", data);
        }}
        onError={(error) => {
          handleComponentError("Counter", error);
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
          handleComponentLoaded("Business");
          console.log("Seções de negócio carregadas:", data);
        }}
        onError={(error) => {
          handleComponentError("Business", error);
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
          console.warn("Erro ao carregar seções de negócio da API:", error);
        }}
      />
      */}

      {/* Carousel de Cursos */}
      <CoursesCarousel
        onDataLoaded={(data) => {
          handleComponentLoaded("Courses");
          console.log("Cursos carregados:", data);
        }}
        onError={(error) => {
          handleComponentError("Courses", error);
        }}
      />

      {/* Seção de Blog */}
      <BlogSection
        onDataLoaded={(data) => {
          handleComponentLoaded("Blog");
          console.log("Posts do blog carregados:", data);
        }}
        onError={(error) => {
          handleComponentError("Blog", error);
        }}
      />

      {/* Logos das Empresas */}
      <LogoEnterprises
        onDataLoaded={(data) => {
          handleComponentLoaded("Logos");
          console.log("Logos das empresas carregados:", data);
        }}
        onError={(error) => {
          handleComponentError("Logos", error);
        }}
      />
    </div>
  );
}
