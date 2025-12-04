"use client";

import { useCallback, useMemo, useState } from "react";
import {
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { HorizontalTabs } from "@/components/ui/custom";
import type { HorizontalTabItem } from "@/components/ui/custom";
import { Skeleton } from "@/components/ui/skeleton";
import { getVagaById } from "@/api/vagas/admin";
import { getSolicitacaoById } from "@/api/vagas/solicitacoes";
import type { VagaDetail } from "@/api/vagas/admin/types";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { useUserRole } from "@/hooks/useUserRole";
import { UserRole } from "@/config/roles";
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
  const userRole = useUserRole();

  // SETOR_DE_VAGAS usa endpoint de solicitações que retorna todos os status
  const isSetorDeVagas = userRole === UserRole.SETOR_DE_VAGAS;

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
      // SETOR_DE_VAGAS usa endpoint de solicitações que retorna todos os status
      if (isSetorDeVagas) {
        const response = await getSolicitacaoById(vagaId);
        // O endpoint de solicitações pode retornar a vaga diretamente ou dentro de "data"
        return "data" in response ? response.data : response;
      }
      // ADMIN e MODERADOR usam endpoint padrão
      const response = await getVagaById(vagaId);
      return "data" in response ? response.data : response;
    },
    initialData: initialQueryData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !!userRole, // Só executa quando a role estiver carregada
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
      <div className="space-y-8">
        {/* Skeleton do HeaderInfo */}
        <section className="relative overflow-hidden rounded-3xl bg-white">
          <div className="relative flex flex-col gap-6 px-6 py-6 sm:px-8 sm:py-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              <div className="relative">
                <Skeleton className="h-20 w-20 rounded-full bg-gray-200" />
                <Skeleton className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-gray-200 border-2 border-white" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-7 w-64 bg-gray-200" />
                  <Skeleton className="h-6 w-24 rounded-full bg-gray-200" />
                  <Skeleton className="h-6 w-6 rounded-full bg-gray-200" />
                </div>
                <Skeleton className="h-4 w-48 bg-gray-200" />
              </div>
            </div>
            <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
              <Skeleton className="h-10 w-32 rounded-full bg-gray-200" />
              <Skeleton className="h-10 w-24 rounded-full bg-gray-200" />
            </div>
          </div>
        </section>

        {/* Skeleton das Tabs */}
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex items-center gap-1 overflow-x-auto px-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-4 border-b-2 border-transparent">
                  <Skeleton className="h-4 w-4 bg-gray-200" />
                  <Skeleton className="h-4 w-20 bg-gray-200" />
                </div>
              ))}
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Coluna esquerda - Conteúdo principal */}
                <div className="lg:col-span-2 space-y-4">
                  <div>
                    <Skeleton className="h-6 w-32 bg-gray-200 mb-3" />
                    <Skeleton className="h-4 w-full bg-gray-200 mb-2" />
                    <Skeleton className="h-4 w-full bg-gray-200 mb-2" />
                    <Skeleton className="h-4 w-3/4 bg-gray-200" />
                  </div>
                </div>
                {/* Coluna direita - Informações */}
                <div className="lg:col-span-1 space-y-4">
                  <div>
                    <Skeleton className="h-6 w-40 bg-gray-200 mb-4" />
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                          <Skeleton className="h-4 w-4 bg-gray-200" />
                          <div className="flex-1 space-y-1">
                            <Skeleton className="h-3 w-24 bg-gray-200" />
                            <Skeleton className="h-4 w-32 bg-gray-200" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
