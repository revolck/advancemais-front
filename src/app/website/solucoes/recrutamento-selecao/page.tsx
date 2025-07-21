"use client";

import React, { useEffect, useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import HeaderPages from "@/theme/website/components/header-pages";
import type { HeaderPageData } from "@/theme/website/components/header-pages/types";
import CounterInformationRecruting from "@/theme/website/components/counter-information-recruting";
import ProblemSolutionSection from "@/theme/website/components/problem-solution-section";
import ServiceHighlight from "@/theme/website/components/service-highlight";
import ServiceBenefits from "@/theme/website/components/service-benefits";
import ProcessSteps from "@/theme/website/components/process-steps";
import LogoEnterprises from "@/theme/website/components/logo-enterprises";
import PricingPlans from "@/theme/website/components/pricing-plans";
import ContactFormSection from "@/theme/website/components/contact-form-section";

/**
 * Página Sobre Nós
 *
 * Apresenta informações sobre a empresa, história, missão e valores
 */
export default function RecrutamentoPage() {
  const [isClient, setIsClient] = useState(false);

  // Configura o título da página
  usePageTitle("Recrutamento & Seleção");

  // Dados mockados específicos para esta página
  const headerData: HeaderPageData = {
    id: "sobre-custom",
    title: "Sobre a AdvanceMais",
    subtitle: "Nossa História",
    description:
      "Conheça nossa trajetória, missão e valores. Há mais de 10 anos transformando empresas e desenvolvendo talentos com soluções inovadoras e personalizadas.",
    buttonText: "Nossa equipe",
    buttonUrl: "/sobre/equipe",
    imageUrl: "/images/headers/sobre-header.webp",
    imageAlt: "Sobre a AdvanceMais - Nossa História",
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
        <section className="relative min-h-[300px] bg-gray-100 dark:bg-gray-800">
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
      <CounterInformationRecruting
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
      <ProblemSolutionSection fetchFromApi={false} />

      <ServiceHighlight
        fetchFromApi={false}
        onDataLoaded={(data) => {
          console.log("Service highlight carregado:", data);
        }}
        onError={(error) => {
          console.warn("Erro ao carregar service highlight:", error);
        }}
      />

      <ServiceBenefits
        fetchFromApi={false}
        onDataLoaded={(data) => {
          console.log("Benefícios dos serviços carregados:", data);
        }}
        onError={(error) => {
          console.warn("Erro ao carregar benefícios:", error);
        }}
      />

      <ProcessSteps fetchFromApi={false} />

      <PricingPlans
        title="Planos de Recrutamento"
        subtitle="Escolha o plano ideal para suas necessidades"
        fetchFromApi={false}
        // VERSÃO SIMPLES SEM CALLBACK
      />

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
