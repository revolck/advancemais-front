"use client";

import React, { useEffect, useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import HeaderPages from "@/theme/website/components/header-pages";
import type { HeaderPageData } from "@/theme/website/components/header-pages/types";
import TrainingResults from "@/theme/website/components/training-results";
import CommunicationHighlights from "@/theme/website/components/communication-highlights";
import ServiceBenefits from "@/theme/website/components/service-benefits";
import LogoEnterprises from "@/theme/website/components/logo-enterprises";
import ContactFormSection from "@/theme/website/components/contact-form-section";

/**
 * Página Sobre Nós
 *
 * Apresenta informações sobre a empresa, história, missão e valores
 */
export default function TreinamentoPage() {
  const [isClient, setIsClient] = useState(false);

  // Configura o título da página
  usePageTitle("Treinamento In Company");

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
      <TrainingResults fetchFromApi={true} />

      <ServiceBenefits fetchFromApi={true} service="treinamento" />

      <CommunicationHighlights fetchFromApi={true} />

      {/* ============================================= */}
      {/* Logos Enterprises: Com dados padrão (SEM API) */}
      {/* ============================================= */}
      <LogoEnterprises
        fetchFromApi={false}
        title="Quem está com a gente nessa jornada"
      />
      <ContactFormSection
        fetchFromApi={false}
        onSubmitSuccess={(data) => console.log("Enviado:", data)}
      />
    </div>
  );
}
