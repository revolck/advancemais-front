"use client";

import React from "react";
import {
  VerticalTabs,
  type VerticalTabItem,
} from "@/components/ui/custom";

export default function RecrutamentoPage() {
  const items: VerticalTabItem[] = [
    {
      value: "banner",
      label: "Banner",
      icon: "Image",
      content: (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold mb-2">Banner</h3>
        </div>
      ),
    },
    {
      value: "sobre",
      label: "Sobre",
      icon: "Info",
      content: (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold mb-2">Sobre</h3>
        </div>
      ),
    },
    {
      value: "resultados",
      label: "Resultados",
      icon: "BarChart",
      content: (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold mb-2">Resultados</h3>
        </div>
      ),
    },
    {
      value: "servicos",
      label: "Serviços",
      icon: "Briefcase",
      content: (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold mb-2">Serviços</h3>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-5 h-full min-h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex-1 min-h-0">
        <VerticalTabs
          items={items}
          defaultValue="banner"
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
