"use client";

import React from "react";
import {
  VerticalTabs,
  type VerticalTabItem,
} from "@/components/ui/custom";
import LogosForm from "./logos/LogosForm";
import DepoimentosForm from "./depoimentos/DepoimentosForm";
import SocialsForm from "./socials/SocialsForm";
import EnderecoForm from "./endereco/EnderecoForm";
import ContatoForm from "./contato/ContatoForm";
import AtendimentoForm from "./atendimento/AtendimentoForm";

export default function GeralPage() {
  const items: VerticalTabItem[] = [
    {
      value: "socials",
      label: "Redes sociais",
      icon: "Share2",
      content: <SocialsForm />,
    },
    {
      value: "endereco",
      label: "Endereço",
      icon: "MapPin",
      content: <EnderecoForm />,
    },
    {
      value: "contato",
      label: "Contato",
      icon: "Phone",
      content: <ContatoForm />,
    },
    {
      value: "atendimento",
      label: "Atendimento",
      icon: "Clock",
      content: <AtendimentoForm />,
    },
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
          defaultValue="socials"
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
