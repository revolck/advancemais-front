"use client";

import React from "react";
import {
  VerticalTabs,
  type VerticalTabItem,
} from "@/components/ui/custom";
import LogosForm from "./logos/LogosForm";
import DepoimentosForm from "./depoimentos/DepoimentosForm";

export default function GeralPage() {
  const items: VerticalTabItem[] = [
    {
      value: "depoimentos",
      label: "Depoimentos",
      icon: "MessageSquare",
      content: <DepoimentosForm />,
    },
    {
      value: "logos",
      label: "Logos",
      icon: "Image",
      content: <LogosForm />,
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-5 h-full min-h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex-1 min-h-0">
        <VerticalTabs
          items={items}
          defaultValue="depoimentos"
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
