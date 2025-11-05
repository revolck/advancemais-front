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
  getUsuarioById,
  updateUsuario,
  createUsuarioBloqueio,
  revokeUsuarioBloqueio,
} from "@/api/usuarios";
import type {
  GetUsuarioResponse,
  UpdateUsuarioPayload,
  CreateUsuarioBloqueioPayload,
  RevokeUsuarioBloqueioPayload,
} from "@/api/usuarios/types";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { HeaderInfo } from "./components";
import {
  AboutTab,
  CurriculosTab,
  CandidaturasTab,
  CursosInscricoesTab,
} from "./tabs";
import {
  BloquearUsuarioModal,
  DesbloquearUsuarioModal,
  EditarUsuarioModal,
  EditarUsuarioEnderecoModal,
  ResetarSenhaUsuarioModal,
} from "./modal-acoes";
import type { UsuarioDetailsData, UsuarioDetailsViewProps } from "./types";

export function UsuarioDetailsView({
  usuarioId,
  initialData,
}: UsuarioDetailsViewProps) {
  const queryClient = useQueryClient();
  const queryKey = useMemo(
    () => queryKeys.usuarios.detail(usuarioId),
    [usuarioId]
  );

  const initialResponse = useMemo<GetUsuarioResponse>(
    () => ({
      success: true,
      usuario: initialData,
    }),
    [initialData]
  );

  const {
    data: usuarioResponse,
    status,
    error,
    isFetching,
    isLoading,
  } = useQuery<GetUsuarioResponse, Error>({
    queryKey,
    queryFn: () => getUsuarioById(usuarioId),
    initialData: initialResponse,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const usuarioData = usuarioResponse?.usuario ?? null;
  const isPending = !initialData && isLoading;
  const isReloading = isFetching && status === "success";
  const queryErrorMessage =
    status === "error"
      ? error?.message ?? "Erro ao carregar usuário."
      : null;

  const invalidateUsuario = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditEnderecoOpen, setIsEditEnderecoOpen] = useState(false);
  const [isResetSenhaOpen, setIsResetSenhaOpen] = useState(false);
  const [isBloquearModalOpen, setIsBloquearModalOpen] = useState(false);
  const [isDesbloquearModalOpen, setIsDesbloquearModalOpen] = useState(false);

  const updateUsuarioMutation = useMutation({
    mutationFn: (payload: UpdateUsuarioPayload) =>
      updateUsuario(usuarioId, payload),
    onSuccess: (response) => {
      queryClient.setQueryData(queryKey, response);
    },
  });

  const bloquearUsuarioMutation = useMutation({
    mutationFn: (payload: CreateUsuarioBloqueioPayload) =>
      createUsuarioBloqueio(usuarioId, payload),
    onSuccess: () => {
      void invalidateUsuario();
    },
  });

  const desbloquearUsuarioMutation = useMutation({
    mutationFn: (payload?: RevokeUsuarioBloqueioPayload) =>
      revokeUsuarioBloqueio(usuarioId, payload),
    onSuccess: () => {
      void invalidateUsuario();
    },
  });

  if (isPending && !usuarioData) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Carregando dados do usuário...</span>
        </div>
      </div>
    );
  }

  if (!usuarioData) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {queryErrorMessage ?? "Usuário não encontrado"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const tabs: HorizontalTabItem[] = useMemo(() => {
    const baseTabs: HorizontalTabItem[] = [
      {
        value: "sobre",
        label: "Sobre",
        icon: "User",
        content: <AboutTab usuario={usuarioData} isLoading={isReloading} />,
      },
    ];

    // Adicionar tabs específicas por role
    if (usuarioData.role === "ALUNO_CANDIDATO") {
      baseTabs.push(
        {
          value: "curriculos",
          label: "Currículos",
          icon: "FileText",
          content: (
            <CurriculosTab usuario={usuarioData} isLoading={isReloading} />
          ),
        },
        {
          value: "candidaturas",
          label: "Candidaturas",
          icon: "Briefcase",
          content: (
            <CandidaturasTab usuario={usuarioData} isLoading={isReloading} />
          ),
        },
        {
          value: "cursos",
          label: "Inscrições em Cursos",
          icon: "GraduationCap",
          content: (
            <CursosInscricoesTab
              usuario={usuarioData}
              isLoading={isReloading}
            />
          ),
        }
      );
    }

    return baseTabs;
  }, [usuarioData, isReloading]);

  return (
    <div className="space-y-8">
      {queryErrorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{queryErrorMessage}</AlertDescription>
        </Alert>
      )}

      <HeaderInfo
        usuario={usuarioData}
        onEditUsuario={() => setIsEditModalOpen(true)}
        onEditEndereco={() => setIsEditEnderecoOpen(true)}
        onResetSenha={() => setIsResetSenhaOpen(true)}
        onBloquearUsuario={() => setIsBloquearModalOpen(true)}
        onDesbloquearUsuario={() => setIsDesbloquearModalOpen(true)}
      />

      <HorizontalTabs items={tabs} defaultValue="sobre" />

      {/* Modais */}
      {usuarioData && (
        <>
          <EditarUsuarioModal
            isOpen={isEditModalOpen}
            onOpenChange={setIsEditModalOpen}
            usuario={usuarioData}
            onConfirm={async (data) => {
              await updateUsuarioMutation.mutateAsync(data);
            }}
          />

          <BloquearUsuarioModal
            isOpen={isBloquearModalOpen}
            onOpenChange={setIsBloquearModalOpen}
            usuarioNome={usuarioData.nomeCompleto}
            usuarioRole={usuarioData.role}
            onConfirm={async (payload) => {
              await bloquearUsuarioMutation.mutateAsync(payload);
            }}
          />

          <DesbloquearUsuarioModal
            isOpen={isDesbloquearModalOpen}
            onOpenChange={setIsDesbloquearModalOpen}
            usuarioNome={usuarioData.nomeCompleto}
            onConfirm={async (obs?: string) => {
              await desbloquearUsuarioMutation.mutateAsync(
                obs ? { observacoes: obs } : undefined
              );
            }}
          />

          <EditarUsuarioEnderecoModal
            isOpen={isEditEnderecoOpen}
            onOpenChange={setIsEditEnderecoOpen}
            usuario={usuarioData}
            onConfirm={async (endereco) => {
              await updateUsuarioMutation.mutateAsync(endereco as any);
            }}
          />

          <ResetarSenhaUsuarioModal
            isOpen={isResetSenhaOpen}
            onOpenChange={setIsResetSenhaOpen}
            email={usuarioData.email}
            allowManual={true}
            onManualSubmit={async (senha, confirmarSenha) => {
              await updateUsuarioMutation.mutateAsync({
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
