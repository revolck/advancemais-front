"use client";

import React from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import HeaderPages from "@/theme/website/components/header-pages";
import ProblemSolutionSection from "@/theme/website/components/problem-solution-section";

export default function RecrutamentoPage() {
  usePageTitle("Recrutamento & Seleção");

  return (
    <div className="min-h-screen">
      <HeaderPages fetchFromApi={true} currentPage="/recrutamento" />
      <ProblemSolutionSection fetchFromApi={true} />
    </div>
  );
}
