"use client";

import { useCallback, useMemo, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { AlertCircle, Loader2 } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { HorizontalTabs } from "@/components/ui/custom";
import type { HorizontalTabItem } from "@/components/ui/custom";
import {
  getAdminCandidatoConsolidated,
  atualizarStatusCandidatura,
  bloquearCandidato,
  desbloquearCandidato,
  type AdminCandidatoConsolidatedData,
} from "@/api/candidatos/admin";
import type { CandidaturaStatus } from "@/api/candidatos/types";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { HeaderInfo } from "./components/HeaderInfo";
import { AboutTab } from "./tabs/AboutTab";
import { CandidaturasTab } from "./tabs/CandidaturasTab";
import { CurriculosTab } from "./tabs/CurriculosTab";
import { ContatoTab } from "./tabs/ContatoTab";
import {
  BloquearCandidatoModal,
  DesbloquearCandidatoModal,
  EditarCandidatoModal,
} from "./modal-acoes";
import type {
  CandidatoDetailsData,
  CandidatoDetailsViewProps,
} from "./types";

const CANDIDATO_QUERY_STALE_TIME = 5 * 60 * 1000;
const CANDIDATO_QUERY_GC_TIME = 30 * 60 * 1000;

type EditPayload = Partial<CandidatoDetailsData>;

export function CandidatoDetailsView({
  candidatoId,
  initialConsolidated,
}: CandidatoDetailsViewProps) {
  const queryClient = useQueryClient();
  const queryKey = useMemo(
    () => queryKeys.candidatos.detail(candidatoId),
    [candidatoId]
  );

  const {
    data: consolidatedData,
    status,
    error,
    isFetching,
    isLoading,
  } = useQuery<AdminCandidatoConsolidatedData, Error>({
    queryKey,
    queryFn: () => getAdminCandidatoConsolidated(candidatoId),
    initialData: initialConsolidated,
    staleTime: CANDIDATO_QUERY_STALE_TIME,
    gcTime: CANDIDATO_QUERY_GC_TIME,
  });

  const updateCachedData = useCallback(
    (
      updater: (
        current: AdminCandidatoConsolidatedData
      ) => AdminCandidatoConsolidatedData
    ) => {
      queryClient.setQueryData<AdminCandidatoConsolidatedData>(
        queryKey,
        (prev) => {
          if (!prev) return prev ?? initialConsolidated;
          return updater(prev);
        }
      );
    },
    [initialConsolidated, queryClient, queryKey]
  );

  const candidatoData = consolidatedData?.candidato ?? null;
  const candidaturas =
    consolidatedData?.candidaturas?.recentes ??
    candidatoData?.candidaturas ??
    [];
  const curriculos =
    consolidatedData?.curriculos?.recentes ?? candidatoData?.curriculos ?? [];

  const isPending = !initialConsolidated && isLoading;
  const queryErrorMessage =
    status === "error"
      ? error?.message ?? "Não foi possível carregar o candidato."
      : null;
  const isReloading = isFetching && status === "success";

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBloquearModalOpen, setIsBloquearModalOpen] = useState(false);
  const [isDesbloquearModalOpen, setIsDesbloquearModalOpen] = useState(false);

  const editCandidatoMutation = useMutation({
    mutationFn: async (payload: EditPayload) => {
      // TODO: Substituir por integração real quando endpoint estiver disponível
      console.warn(
        "[CandidatoDetails] Atualização de candidato sem endpoint real",
        payload
      );
      return payload;
    },
    onSuccess: (payload) => {
      updateCachedData((prev) => ({
        ...prev,
        candidato: {
          ...prev.candidato,
          ...Object.fromEntries(
            Object.entries(payload).filter(
              ([, value]) => value !== undefined
            )
          ),
        },
      }));
    },
  });

  const atualizarStatusMutation = useMutation({
    mutationFn: async ({
      candidaturaId,
      status,
    }: {
      candidaturaId: string;
      status: CandidaturaStatus;
    }) => atualizarStatusCandidatura(candidaturaId, status),
    onSuccess: (updated) => {
      updateCachedData((prev) => ({
        ...prev,
        candidaturas: prev.candidaturas
          ? {
              ...prev.candidaturas,
              recentes: prev.candidaturas.recentes.map((item) =>
                item.id === updated.id ? { ...item, ...updated } : item
              ),
            }
          : prev.candidaturas,
        candidato: {
          ...prev.candidato,
          candidaturas: prev.candidato.candidaturas.map((item) =>
            item.id === updated.id ? { ...item, ...updated } : item
          ),
        },
      }));
    },
  });

  const bloquearCandidatoMutation = useMutation({
    mutationFn: async ({
      motivo,
      duracao,
    }: {
      motivo: string;
      duracao?: number;
    }) => bloquearCandidato(candidatoId, motivo, duracao),
    onSuccess: () => {
      updateCachedData((prev) => ({
        ...prev,
        candidato: {
          ...prev.candidato,
          status: "BLOQUEADO",
        },
      }));
    },
  });

  const desbloquearCandidatoMutation = useMutation({
    mutationFn: async () => desbloquearCandidato(candidatoId),
    onSuccess: () => {
      updateCachedData((prev) => ({
        ...prev,
        candidato: {
          ...prev.candidato,
          status: "ATIVO",
        },
      }));
    },
  });

  const handleUpdateStatus = useCallback(
    async (candidaturaId: string, status: string) => {
      await atualizarStatusMutation.mutateAsync({
        candidaturaId,
        status: status as CandidaturaStatus,
      });
    },
    [atualizarStatusMutation]
  );

  if (isPending && !candidatoData) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Carregando dados do candidato...</span>
        </div>
      </div>
    );
  }

  if (!candidatoData) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {queryErrorMessage ?? "Candidato não encontrado"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const tabs: HorizontalTabItem[] = [
    {
      value: "sobre",
      label: "Sobre",
      icon: "User",
      content: <AboutTab candidato={candidatoData} isLoading={isReloading} />,
    },
    {
      value: "candidaturas",
      label: "Candidaturas",
      icon: "Briefcase",
      content: (
        <CandidaturasTab
          candidato={candidatoData}
          candidaturas={candidaturas}
          onUpdateStatus={handleUpdateStatus}
          isLoading={isReloading || atualizarStatusMutation.isPending}
        />
      ),
    },
    {
      value: "curriculos",
      label: "Currículos",
      icon: "FileText",
      content: (
        <CurriculosTab
          candidato={candidatoData}
          curriculos={curriculos}
          isLoading={isReloading}
        />
      ),
    },
    {
      value: "contato",
      label: "Contato",
      icon: "Mail",
      content: <ContatoTab candidato={candidatoData} isLoading={isReloading} />,
    },
  ];

  return (
    <div className="space-y-8">
      {queryErrorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{queryErrorMessage}</AlertDescription>
        </Alert>
      )}

      <HeaderInfo
        candidato={candidatoData}
        onEditCandidato={() => setIsEditModalOpen(true)}
        onBloquearCandidato={() => setIsBloquearModalOpen(true)}
        onDesbloquearCandidato={() => setIsDesbloquearModalOpen(true)}
        onUpdateStatus={handleUpdateStatus}
      />

      <HorizontalTabs items={tabs} defaultValue="sobre" />

      <EditarCandidatoModal
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        candidato={candidatoData}
        onConfirm={async (payload) => {
          await editCandidatoMutation.mutateAsync(payload);
        }}
      />

      <BloquearCandidatoModal
        isOpen={isBloquearModalOpen}
        onOpenChange={setIsBloquearModalOpen}
        candidatoNome={candidatoData.nomeCompleto}
        onConfirm={async ({ motivo, duracao }) => {
          await bloquearCandidatoMutation.mutateAsync({ motivo, duracao });
        }}
      />

      <DesbloquearCandidatoModal
        isOpen={isDesbloquearModalOpen}
        onOpenChange={setIsDesbloquearModalOpen}
        candidatoNome={candidatoData.nomeCompleto}
        onConfirm={async () => {
          await desbloquearCandidatoMutation.mutateAsync();
        }}
      />
    </div>
  );
}
