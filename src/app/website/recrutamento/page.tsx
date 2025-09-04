import React from "react";
import HeaderPages from "@/theme/website/components/header-pages";
import ProblemSolutionSection from "@/theme/website/components/problem-solution-section";
import AdvanceAjuda from "@/theme/website/components/advance-ajuda";
import ServiceBenefits from "@/theme/website/components/service-benefits";

export const metadata = {
  title: "Recrutamento & Seleção",
};

export default function RecrutamentoPage() {
  return (
    <div className="min-h-screen">
      <HeaderPages fetchFromApi={true} currentPage="/recrutamento" />
      <ProblemSolutionSection fetchFromApi={true} />
      <AdvanceAjuda fetchFromApi={true} />
      <ServiceBenefits fetchFromApi={true} service="recrutamentoSelecao" />
    </div>
  );
}
