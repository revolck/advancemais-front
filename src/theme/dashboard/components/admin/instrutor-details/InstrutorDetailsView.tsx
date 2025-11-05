"use client";

import { useMemo, useState, useCallback } from "react";
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
  getInstrutorById,
  updateInstrutor,
  createInstrutorBloqueio,
  revokeInstrutorBloqueio,
} from "@/api/usuarios";
import type {
  GetInstrutorResponse,
  UpdateInstrutorPayload,
  CreateInstrutorBloqueioPayload,
  RevokeInstrutorBloqueioPayload,
} from "@/api/usuarios/types";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { HeaderInfo } from "./components";
import { AboutTab } from "./tabs";
import {
  BloquearInstrutorModal,
  DesbloquearInstrutorModal,
  EditarInstrutorModal,
  EditarInstrutorEnderecoModal,
  ResetarSenhaInstrutorModal,
} from "./modal-acoes";
import type { InstrutorDetailsData, InstrutorDetailsViewProps } from "./types";

export function InstrutorDetailsView({
  instrutorId,
  initialData,
}: InstrutorDetailsViewProps) {
  const queryClient = useQueryClient();
  const queryKey = useMemo(
    () => queryKeys.instrutores.detail(instrutorId),
    [instrutorId]
  );

  const initialResponse = useMemo<GetInstrutorResponse>(
    () => ({
      success: true,
      data: initialData,
    }),
    [initialData]
  );

  const {
    data: instrutorResponse,
    status,
    error,
    isFetching,
    isLoading,
  } = useQuery<GetInstrutorResponse, Error>({
    queryKey,
    queryFn: () => getInstrutorById(instrutorId),
    initialData: initialResponse,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const instrutorData = instrutorResponse?.data ?? null;
  const isPending = !initialData && isLoading;
  const isReloading = isFetching && status === "success";
  const queryErrorMessage =
    status === "error"
      ? error?.message ?? "Erro ao carregar instrutor."
      : null;

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditEnderecoOpen, setIsEditEnderecoOpen] = useState(false);
  const [isResetSenhaOpen, setIsResetSenhaOpen] = useState(false);
  const [isBloquearModalOpen, setIsBloquearModalOpen] = useState(false);
  const [isDesbloquearModalOpen, setIsDesbloquearModalOpen] = useState(false);

  const invalidateInstrutor = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  const updateInstrutorMutation = useMutation({
    mutationFn: (payload: UpdateInstrutorPayload) =>
      updateInstrutor(instrutorId, payload),
    onSuccess: (response) => {
      queryClient.setQueryData(queryKey, response);
    },
  });

  const bloquearInstrutorMutation = useMutation({
    mutationFn: (payload: CreateInstrutorBloqueioPayload) =>
      createInstrutorBloqueio(instrutorId, payload),
    onSuccess: () => {
      void invalidateInstrutor();
    },
  });

  const desbloquearInstrutorMutation = useMutation({
    mutationFn: (payload?: RevokeInstrutorBloqueioPayload) =>
      revokeInstrutorBloqueio(instrutorId, payload),
    onSuccess: () => {
      void invalidateInstrutor();
    },
  });

  if (isPending && !instrutorData) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Carregando dados do instrutor...</span>
        </div>
      </div>
    );
  }

  if (!instrutorData) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {queryErrorMessage ?? "Instrutor não encontrado"}
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
      content: <AboutTab instrutor={instrutorData} isLoading={isReloading} />,
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
        instrutor={instrutorData}
        onEditInstrutor={() => setIsEditModalOpen(true)}
        onEditEndereco={() => setIsEditEnderecoOpen(true)}
        onResetSenha={() => setIsResetSenhaOpen(true)}
        onBloquearInstrutor={() => setIsBloquearModalOpen(true)}
        onDesbloquearInstrutor={() => setIsDesbloquearModalOpen(true)}
      />

      <HorizontalTabs items={tabs} defaultValue="sobre" />

      {/* Modais */}
      {instrutorData && (
        <>
          <EditarInstrutorModal
            isOpen={isEditModalOpen}
            onOpenChange={setIsEditModalOpen}
            instrutor={instrutorData}
            onConfirm={async (data) => {
              await updateInstrutorMutation.mutateAsync(data);
            }}
          />

          <BloquearInstrutorModal
            isOpen={isBloquearModalOpen}
            onOpenChange={setIsBloquearModalOpen}
            instrutorNome={instrutorData.nomeCompleto}
            onConfirm={async (payload) => {
              await bloquearInstrutorMutation.mutateAsync(payload);
            }}
          />

          <DesbloquearInstrutorModal
            isOpen={isDesbloquearModalOpen}
            onOpenChange={setIsDesbloquearModalOpen}
            instrutorNome={instrutorData.nomeCompleto}
            onConfirm={async (obs) => {
              await desbloquearInstrutorMutation.mutateAsync(
                obs ? { observacoes: obs } : undefined
              );
            }}
          />

          <EditarInstrutorEnderecoModal
            isOpen={isEditEnderecoOpen}
            onOpenChange={setIsEditEnderecoOpen}
            instrutor={instrutorData}
            onConfirm={async (endereco) => {
              await updateInstrutorMutation.mutateAsync(endereco as any);
            }}
          />

          <ResetarSenhaInstrutorModal
            isOpen={isResetSenhaOpen}
            onOpenChange={setIsResetSenhaOpen}
            email={instrutorData.email}
            allowManual={true}
            onManualSubmit={async (senha, confirmarSenha) => {
              await updateInstrutorMutation.mutateAsync({
                senha,
                confirmarSenha,
              } as any);
            }}
          />
        </>
      )}
    </div>
  );
}
