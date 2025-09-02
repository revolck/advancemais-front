import React from "react";
import HeaderPages from "@/theme/website/components/header-pages";
import ProblemSolutionSection from "@/theme/website/components/problem-solution-section";
import { getPlaninhasSectionData } from "@/api/websites/components";

export const metadata = {
  title: "Recrutamento & Seleção",
};

export default async function RecrutamentoPage() {
  const planinhasData = await getPlaninhasSectionData();

  return (
    <div className="min-h-screen">
      <HeaderPages fetchFromApi={true} currentPage="/recrutamento" />
      <ProblemSolutionSection fetchFromApi={false} staticData={planinhasData} />
    </div>
  );
}
