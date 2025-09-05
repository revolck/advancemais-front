"use client";

import React from "react";
import {
  VerticalTabs,
  type VerticalTabItem,
} from "@/components/ui/custom";
import HeaderForm from "./header/HeaderForm";
import TreinamentoForm from "./treinamento/TreinamentoForm";
import CompanyForm from "./company/CompanyForm";

export default function TreinamentoPage() {
  const items: VerticalTabItem[] = [
    {
      value: "header",
      label: "Cabeçalho",
      icon: "Type",
      content: (
        <div className="space-y-6">
          <HeaderForm />
        </div>
      ),
    },
    {
      value: "treinamento",
      label: "Treinamento",
      icon: "BookOpen",
      content: (
        <div className="space-y-6">
          <TreinamentoForm />
        </div>
      ),
    },
    {
      value: "company",
      label: "Company",
      icon: "Building2",
      content: (
        <div className="space-y-6">
          <CompanyForm />
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-5 h-full min-h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex-1 min-h-0">
        <VerticalTabs
          items={items}
          defaultValue="header"
          variant="spacious"
          size="sm"
          withAnimation={true}
          showIndicator={true}
          tabsWidth="md"
          classNames={{
            root: "h-full",
            contentWrapper: "h-full overflow-hidden",
            tabsContent: "h-full overflow-auto p-6",
            tabsList: "p-2",
            tabsTrigger: "mb-1",
          }}
        />
      </div>
    </div>
  );
}
