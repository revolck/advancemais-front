"use client";

import React, { useEffect } from "react";
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
import { apiKeepAlive } from "@/lib/api-keep-alive";

/**
 * Página Inicial do Website Institucional
 *
 * Esta é a homepage que representa a AdvanceMais como empresa
 * e apresenta seus serviços, cursos e soluções.
 */
export default function WebsiteHomePage() {
  const { setReady, setError } = useWebsiteLoading();

  // Configura o título da página
  usePageTitle("Página Inicial");

  useEffect(() => {
    // Inicia keep-alive da API
    apiKeepAlive.start();

    // Auto-ready após 2.5 segundos (antes do timeout de 3s)
    const timer = setTimeout(() => {
      console.log("📄 Página principal marcada como pronta");
      setReady(true);
    }, 2500);

    return () => {
      clearTimeout(timer);
      apiKeepAlive.stop();
    };
  }, [setReady]);

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
    </div>
  );
}
