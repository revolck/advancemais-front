import React from "react";
import HeaderPages from "@/theme/website/components/header-pages";
import ServiceBenefits from "@/theme/website/components/service-benefits";

export const metadata = {
  title: "Treinamento",
};

export default function TreinamentoPage() {
  return (
    <div className="min-h-screen">
      <HeaderPages fetchFromApi={true} currentPage="/treinamento" />
      <ServiceBenefits fetchFromApi={true} service="treinamentoCompany" />
    </div>
  );
}

