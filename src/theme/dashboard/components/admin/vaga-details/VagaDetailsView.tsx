"use client";

import { useCallback, useMemo, useState } from "react";
import {
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { HorizontalTabs } from "@/components/ui/custom";
import type { HorizontalTabItem } from "@/components/ui/custom";
import { getVagaById } from "@/api/vagas/admin";
import type { VagaDetail } from "@/api/vagas/admin/types";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { HeaderInfo } from "./components/HeaderInfo";
import { AboutTab } from "./tabs/AboutTab";
import { RequisitosTab } from "./tabs/RequisitosTab";
import { AtividadesTab } from "./tabs/AtividadesTab";
import { BeneficiosTab } from "./tabs/BeneficiosTab";
import { SalarioVagasTab } from "./tabs/SalarioVagasTab";
import { LocalizacaoTab } from "./tabs/LocalizacaoTab";
import { DetailsTab } from "./tabs/DetailsTab";
import { CandidatosTab } from "./tabs/CandidatosTab";
import { EditVagaTab } from "./tabs/EditVagaTab";
import type { VagaDetailsViewProps } from "./types";

export function VagaDetailsView({
  vagaId,
  initialData,
}: VagaDetailsViewProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const queryKey = useMemo(
    () => queryKeys.vagas.detail(vagaId),
    [vagaId]
  );

  const initialQueryData = useMemo<VagaDetail | undefined>(
    () => (initialData ? initialData : undefined),
    [initialData]
  );

  const {
    data: vagaData,
    status,
    error,
    isLoading,
  } = useQuery<VagaDetail>({
    queryKey,
    queryFn: async () => {
      const response = await getVagaById(vagaId);
      return "data" in response ? response.data : response;
    },
    initialData: initialQueryData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const errorMessage =
    status === "error"
      ? error?.message ?? "Não foi possível carregar os dados da vaga."
      : null;

  const isPending = isLoading && !vagaData;

  const handleEditVaga = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleEditSuccess = useCallback(
    (updatedVaga: VagaDetail) => {
      queryClient.setQueryData(queryKey, updatedVaga);
      void queryClient.invalidateQueries({
        queryKey: ["admin-vagas-list"],
      });
      setIsEditing(false);
    },
    [queryClient, queryKey]
  );

  const handleEditCancel = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleDeleteVaga = useCallback(() => {
    if (!vagaData) return;
    // TODO: Implementar lógica de exclusão
    console.log("Excluir vaga:", vagaData.id);
  }, [vagaData]);

  const handlePublishVaga = useCallback(() => {
    if (!vagaData) return;
    // TODO: Implementar lógica de publicação
    console.log("Publicar vaga:", vagaData.id);
  }, [vagaData]);

  const handleUnpublishVaga = useCallback(() => {
    if (!vagaData) return;
    // TODO: Implementar lógica de despublicação
    console.log("Despublicar vaga:", vagaData.id);
  }, [vagaData]);

  if (isPending) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Carregando dados da vaga...</span>
        </div>
      </div>
    );
  }

  if (!vagaData) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {errorMessage ?? "Não foi possível carregar os dados da vaga."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const tabs: HorizontalTabItem[] = [
    {
      value: "sobre",
      label: "Sobre",
      icon: "FileText",
      content: <AboutTab vaga={vagaData} />,
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
      value: "candidatos",
      label: "Candidatos",
      icon: "Users",
      content: <CandidatosTab vaga={vagaData} />,
    },
    {
      value: "detalhes",
      label: "Detalhes Técnicos",
      icon: "Settings",
      content: <DetailsTab vaga={vagaData} />,
    },
  ];

  if (isEditing) {
    return (
      <div className="flex flex-col h-full space-y-8">
        <HeaderInfo
          vaga={vagaData}
          onEditVaga={handleEditVaga}
          onDeleteVaga={handleDeleteVaga}
          onPublishVaga={handlePublishVaga}
          onUnpublishVaga={handleUnpublishVaga}
        />

        <div className="flex-1 min-h-0">
          <EditVagaTab
            vaga={vagaData}
            onSuccess={handleEditSuccess}
            onCancel={handleEditCancel}
          />
        </div>
      </div>
    );
  }

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
