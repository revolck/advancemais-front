"use client";

import { useCallback, useEffect, useState } from "react";
import { HorizontalTabs } from "@/components/ui/custom";
import type { HorizontalTabItem } from "@/components/ui/custom";
import type { VagaDetail } from "@/api/vagas/admin/types";
import { HeaderInfo } from "./components/HeaderInfo";
import { AboutTab } from "./tabs/AboutTab";
import { RequisitosTab } from "./tabs/RequisitosTab";
import { AtividadesTab } from "./tabs/AtividadesTab";
import { BeneficiosTab } from "./tabs/BeneficiosTab";
import { SalarioVagasTab } from "./tabs/SalarioVagasTab";
import { LocalizacaoTab } from "./tabs/LocalizacaoTab";
import { DetailsTab } from "./tabs/DetailsTab";
import { CandidatosTab } from "./tabs/CandidatosTab";
import type { VagaDetailsViewProps } from "./types";

export function VagaDetailsView({ vaga }: VagaDetailsViewProps) {
  const [vagaData, setVagaData] = useState(vaga);

  useEffect(() => {
    setVagaData(vaga);
  }, [vaga]);

  const handleVagaUpdated = useCallback((updates: Partial<VagaDetail>) => {
    setVagaData((prev: VagaDetail) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  const handleEditVaga = () => {
    // TODO: Implementar lógica de edição
    console.log("Editar vaga:", vagaData.id);
  };

  const handleDeleteVaga = () => {
    // TODO: Implementar lógica de exclusão
    console.log("Excluir vaga:", vagaData.id);
  };

  const handlePublishVaga = () => {
    // TODO: Implementar lógica de publicação
    console.log("Publicar vaga:", vagaData.id);
  };

  const handleUnpublishVaga = () => {
    // TODO: Implementar lógica de despublicação
    console.log("Despublicar vaga:", vagaData.id);
  };

  const tabs: HorizontalTabItem[] = [
    {
      value: "sobre",
      label: "Sobre",
      icon: "FileText",
      content: <AboutTab vaga={vagaData} />,
    },
    {
      value: "candidatos",
      label: "Candidatos",
      icon: "Users",
      content: <CandidatosTab vaga={vagaData} />,
    },
    {
      value: "requisitos",
      label: "Requisitos",
      icon: "CheckSquare",
      content: <RequisitosTab vaga={vagaData} />,
    },
    {
      value: "atividades",
      label: "Atividades",
      icon: "Briefcase",
      content: <AtividadesTab vaga={vagaData} />,
    },
    {
      value: "beneficios",
      label: "Benefícios",
      icon: "Gift",
      content: <BeneficiosTab vaga={vagaData} />,
    },
    {
      value: "salario-vagas",
      label: "Salário & Vagas",
      icon: "DollarSign",
      content: <SalarioVagasTab vaga={vagaData} />,
    },
    {
      value: "localizacao",
      label: "Localização & Modalidade",
      icon: "MapPin",
      content: <LocalizacaoTab vaga={vagaData} />,
    },
    {
      value: "detalhes",
      label: "Detalhes Técnicos",
      icon: "Settings",
      content: <DetailsTab vaga={vagaData} />,
    },
  ];

  return (
    <div className="space-y-8">
      <HeaderInfo
        vaga={vagaData}
        onEditVaga={handleEditVaga}
        onDeleteVaga={handleDeleteVaga}
        onPublishVaga={handlePublishVaga}
        onUnpublishVaga={handleUnpublishVaga}
      />

      <HorizontalTabs items={tabs} defaultValue="sobre" />

      {/* TODO: Adicionar modais de edição e exclusão quando necessário */}
    </div>
  );
}
