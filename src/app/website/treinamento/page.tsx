import React from "react";
import HeaderPages from "@/theme/website/components/header-pages";
import ServiceBenefits from "@/theme/website/components/service-benefits";
import TrainingResults from "@/theme/website/components/training-results";
import CommunicationHighlights from "@/theme/website/components/communication-highlights";
import LogoEnterprises from "@/theme/website/components/logo-enterprises";

/**
 * Página de Treinamento In Company com cabeçalho e benefícios
 */
export const metadata = {
  title: "Treinamento",
};

export default function TreinamentoPage() {
  return (
    <div className="min-h-screen">
      <HeaderPages fetchFromApi={true} currentPage="/treinamento" />
      <TrainingResults fetchFromApi={true} />
      <CommunicationHighlights fetchFromApi={true} />
      <ServiceBenefits fetchFromApi={true} service="treinamentoCompany" />
      <LogoEnterprises fetchFromApi={true} />
    </div>
  );
}
