"use client";

import React from "react";
import { VerticalTabs, type VerticalTabItem } from "@/components/ui/custom";
import { AreasInteresseForm } from "./areas-interesse/AreasInteresseForm";
import { SubareasInteresseForm } from "./subareas-interesse/SubareasInteresseForm";
import { StatusProcessosForm } from "./status-processos/StatusProcessosForm";

export default function CandidatosDashboardPage() {
  const items: VerticalTabItem[] = [
    {
      value: "areas-interesse",
      label: "Áreas de interesse",
      icon: "Tags",
      content: <AreasInteresseForm />,
    },
    {
      value: "subareas-interesse",
      label: "Subáreas de interesse",
      icon: "ListTree",
      content: <SubareasInteresseForm />,
    },
    {
      value: "status-processos",
      label: "Status de Processos",
      icon: "Settings",
      content: <StatusProcessosForm />,
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-5 h-full min-h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex-1 min-h-0">
        <VerticalTabs
          items={items}
          defaultValue="areas-interesse"
          variant="spacious"
          size="sm"
          withAnimation
          showIndicator
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
