"use client";

import React from "react";
import { VerticalTabs, type VerticalTabItem } from "@/components/ui/custom";
import { StatusProcessosForm } from "./StatusProcessosForm";

export default function StatusProcessosPage() {
  const items: VerticalTabItem[] = [
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
          defaultValue="status-processos"
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







