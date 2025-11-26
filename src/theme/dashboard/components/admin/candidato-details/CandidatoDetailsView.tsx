"use client";

import { useCallback, useMemo, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
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
import { CursosTurmasTab } from "./tabs/CursosTurmasTab";
import {
  BloquearCandidatoModal,
  DesbloquearCandidatoModal,
  EditarCandidatoModal,
  EditarCandidatoEnderecoModal,
  ResetarSenhaCandidatoModal,
  type BloquearCandidatoData,
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
  const [isEditEnderecoOpen, setIsEditEnderecoOpen] = useState(false);
  const [isResetSenhaOpen, setIsResetSenhaOpen] = useState(false);
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
              {[1, 2, 3, 4].map((i) => (
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
      value: "cursos-turmas",
      label: "Cursos/Turmas",
      icon: "Layers",
      content: (
        <CursosTurmasTab
          candidato={candidatoData}
          inscricoes={[]}
          isLoading={isReloading}
        />
      ),
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
        onEditEndereco={() => setIsEditEnderecoOpen(true)}
        onResetSenha={() => setIsResetSenhaOpen(true)}
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

      <EditarCandidatoEnderecoModal
        isOpen={isEditEnderecoOpen}
        onOpenChange={setIsEditEnderecoOpen}
        candidato={candidatoData}
        onConfirm={async (endereco) => {
          await editCandidatoMutation.mutateAsync(endereco as any);
        }}
      />

      <ResetarSenhaCandidatoModal
        isOpen={isResetSenhaOpen}
        onOpenChange={setIsResetSenhaOpen}
        email={candidatoData.email}
        allowManual={true}
        onManualSubmit={async (senha, confirmarSenha) => {
          await editCandidatoMutation.mutateAsync(
            { senha, confirmarSenha } as any
          );
        }}
      />

      <BloquearCandidatoModal
        isOpen={isBloquearModalOpen}
        onOpenChange={setIsBloquearModalOpen}
        candidatoNome={candidatoData.nomeCompleto}
        onConfirm={async (payload: BloquearCandidatoData) => {
          await bloquearCandidatoMutation.mutateAsync({
            motivo: payload.motivo,
            duracao: payload.dias,
          });
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
