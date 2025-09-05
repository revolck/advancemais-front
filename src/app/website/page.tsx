"use client";

import React from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import Slider from "@/theme/website/components/slider";
import AboutSection from "@/theme/website/components/about";
import BannersGroup from "@/theme/website/components/banners";
import ConsultoriaSection from "@/theme/website/components/consultoria-empresarial";
import RecrutamentoSection from "@/theme/website/components/recrutamento";
import LogoEnterprises from "@/theme/website/components/logo-enterprises";

/**
 * Página Inicial do Website Institucional
 *
 * Esta é a homepage que representa a Advance+ como empresa
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

      <BannersGroup />

      <ConsultoriaSection
        onDataLoaded={() => handleComponentLoaded("Consultoria")}
        onError={(error) => handleComponentError("Consultoria", error)}
      />

      <RecrutamentoSection
        onDataLoaded={() => handleComponentLoaded("Recrutamento")}
        onError={(error) => handleComponentError("Recrutamento", error)}
      />

      <LogoEnterprises
        onDataLoaded={() => handleComponentLoaded("LogoEnterprises")}
        onError={(error) => handleComponentError("LogoEnterprises", error)}
      />

      
    </div>
  );
}
