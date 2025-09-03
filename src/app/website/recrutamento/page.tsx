import React from "react";
import HeaderPages from "@/theme/website/components/header-pages";
import ProblemSolutionSection from "@/theme/website/components/problem-solution-section";
import AdvanceAjuda from "@/theme/website/components/advance-ajuda";

export const metadata = {
  title: "Recrutamento & Seleção",
};

export default function RecrutamentoPage() {
  return (
    <div className="min-h-screen">
      <HeaderPages fetchFromApi={true} currentPage="/recrutamento" />
      <ProblemSolutionSection />
      <AdvanceAjuda />
    </div>
  );
}
