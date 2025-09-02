"use client";

import React from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import HeaderPages from "@/theme/website/components/header-pages";
import AccordionGroupInformation from "@/theme/website/components/accordion-group-information";
import TeamShowcase from "@/theme/website/components/team-showcase/TeamShowcase";

/**
 * Página Sobre Nós
 *
 * Apresenta informações sobre a empresa, história, missão e valores
 */
export default function SobrePage() {
  // Configura o título da página
  usePageTitle("Sobre nós");

  return (
    <div className="min-h-screen">
      <HeaderPages fetchFromApi={true} currentPage="/sobre" />
      <AccordionGroupInformation fetchFromApi={true} />
      <TeamShowcase fetchFromApi={true} title="Conheça nossa Equipe" />
    </div>
  );
}
