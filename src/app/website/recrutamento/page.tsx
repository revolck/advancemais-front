import React from "react";
import HeaderPages from "@/theme/website/components/header-pages";
import ProblemSolutionSection from "@/theme/website/components/problem-solution-section";
import AdvanceAjuda from "@/theme/website/components/advance-ajuda";
import ProcessSteps from "@/theme/website/components/process-steps";
import ServiceBenefits from "@/theme/website/components/service-benefits";
import LogoEnterprises from "@/theme/website/components/logo-enterprises";

export const metadata = {
  title: "Recrutamento & Seleção",
};

export default function RecrutamentoPage() {
  return (
    <div className="min-h-screen">
      <HeaderPages fetchFromApi={true} currentPage="/recrutamento" />
      <ProblemSolutionSection fetchFromApi={true} />
      <AdvanceAjuda fetchFromApi={true} />
      <ProcessSteps />
      <ServiceBenefits fetchFromApi={true} service="recrutamentoSelecao" />
      <LogoEnterprises fetchFromApi={true} />
    </div>
  );
}
