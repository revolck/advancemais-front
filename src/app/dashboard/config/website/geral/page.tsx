"use client";

import React from "react";
import {
  VerticalTabs,
  type VerticalTabItem,
} from "@/components/ui/custom";
import LogosForm from "./logos/LogosForm";

export default function GeralPage() {
  const items: VerticalTabItem[] = [
    {
      value: "telefone",
      label: "Telefone",
      icon: "Phone",
      content: (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold mb-2">Telefone</h3>
        </div>
      ),
    },
    {
      value: "email",
      label: "E-mail",
      icon: "Mail",
      content: (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold mb-2">E-mail</h3>
        </div>
      ),
    },
    {
      value: "redes-sociais",
      label: "Redes Sociais",
      icon: "Share2",
      content: (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold mb-2">Redes Sociais</h3>
        </div>
      ),
    },
    {
      value: "endereco",
      label: "Endereço",
      icon: "MapPin",
      content: (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold mb-2">Endereço</h3>
        </div>
      ),
    },
    {
      value: "depoimentos",
      label: "Depoimentos",
      icon: "MessageSquare",
      content: (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold mb-2">Depoimentos</h3>
        </div>
      ),
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
          defaultValue="telefone"
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
