"use client";

import { useMemo, useState, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { HorizontalTabs } from "@/components/ui/custom";
import type { HorizontalTabItem } from "@/components/ui/custom";
import {
  getInstrutorById,
  updateInstrutor,
  updateUsuarioRole,
  createInstrutorBloqueio,
  revokeInstrutorBloqueio,
  liberarUsuarioAcesso,
} from "@/api/usuarios";
import type {
  GetInstrutorResponse,
  UpdateInstrutorPayload,
  Role,
  UpdateUsuarioRolePayload,
  CreateInstrutorBloqueioPayload,
  RevokeInstrutorBloqueioPayload,
  LiberarUsuarioAcessoPayload,
} from "@/api/usuarios/types";
import { toastCustom } from "@/components/ui/custom/toast";
import { getRoleLabel } from "@/config/roles";
import { useAuth } from "@/hooks/useAuth";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { invalidateUsuarios } from "@/lib/react-query/invalidation";
import { HeaderInfo } from "./components";
import { AboutTab } from "./tabs";
import {
  AlterarFuncaoUsuarioModal,
  BloquearInstrutorModal,
  DesbloquearInstrutorModal,
  EditarInstrutorModal,
  EditarInstrutorEnderecoModal,
  ResetarSenhaInstrutorModal,
} from "./modal-acoes";
import { LiberarEmailUsuarioModal as LiberarAcessoUsuarioModal } from "../usuario-details/modal-acoes/LiberarEmailUsuarioModal";
import type { InstrutorDetailsData, InstrutorDetailsViewProps } from "./types";

const INSTRUTOR_QUERY_STALE_TIME = 30 * 1000;
const INSTRUTOR_QUERY_GC_TIME = 30 * 60 * 1000;

const ALL_MANAGEABLE_ROLES: Role[] = [
  "ADMIN",
  "MODERADOR",
  "EMPRESA",
  "ALUNO_CANDIDATO",
  "INSTRUTOR",
  "PEDAGOGICO",
  "SETOR_DE_VAGAS",
  "RECRUTADOR",
  "FINANCEIRO",
];
const MODERADOR_BLOCKED_ROLES: Role[] = ["ADMIN", "MODERADOR"];
const MODERADOR_ALLOWED_ROLES: Role[] = ALL_MANAGEABLE_ROLES.filter(
  (role) => !MODERADOR_BLOCKED_ROLES.includes(role),
);
const PEDAGOGICO_ALLOWED_ROLES: Role[] = ["ALUNO_CANDIDATO", "INSTRUTOR"];

function getAvailableRoleTransitions(
  actorRole: string | null,
  targetRole: Role | undefined,
  actorUserId?: string | null,
  targetUserId?: string | null,
): Role[] {
  if (!actorRole || !targetRole) return [];
  if (actorUserId && targetUserId && actorUserId === targetUserId) return [];

  switch (actorRole) {
    case "ADMIN":
      return ALL_MANAGEABLE_ROLES;
    case "MODERADOR":
      if (MODERADOR_BLOCKED_ROLES.includes(targetRole)) return [];
      return MODERADOR_ALLOWED_ROLES;
    case "PEDAGOGICO":
      return PEDAGOGICO_ALLOWED_ROLES.includes(targetRole)
        ? PEDAGOGICO_ALLOWED_ROLES
        : [];
    default:
      return [];
  }
}

export function InstrutorDetailsView({
  instrutorId,
  initialData,
}: InstrutorDetailsViewProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = useMemo(
    () => queryKeys.instrutores.detail(instrutorId),
    [instrutorId],
  );

  const initialResponse = useMemo<GetInstrutorResponse>(
    () => ({
      success: true,
      data: initialData,
    }),
    [initialData],
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
    staleTime: INSTRUTOR_QUERY_STALE_TIME,
    gcTime: INSTRUTOR_QUERY_GC_TIME,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const instrutorData = instrutorResponse?.data ?? null;
  const isPending = !initialData && isLoading;
  const isReloading = isFetching && status === "success";
  const queryErrorMessage =
    status === "error"
      ? (error?.message ?? "Erro ao carregar instrutor.")
      : null;

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditEnderecoOpen, setIsEditEnderecoOpen] = useState(false);
  const [isAlterarFuncaoOpen, setIsAlterarFuncaoOpen] = useState(false);
  const [isResetSenhaOpen, setIsResetSenhaOpen] = useState(false);
  const [isLiberarAcessoOpen, setIsLiberarAcessoOpen] = useState(false);
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

  const alterarFuncaoMutation = useMutation({
    mutationFn: (payload: UpdateUsuarioRolePayload) =>
      updateUsuarioRole(instrutorId, payload),
    onSuccess: (response) => {
      const data = response.data;
      queryClient.setQueryData<GetInstrutorResponse | undefined>(
        queryKey,
        (previous) => {
          if (!previous?.data) return previous;
          return {
            ...previous,
            data: {
              ...previous.data,
              role: data.role,
              atualizadoEm: data.atualizadoEm ?? previous.data.atualizadoEm,
            },
          };
        },
      );
      void invalidateInstrutor();
      invalidateUsuarios(queryClient);
      toastCustom.success(
        `Função alterada de ${getRoleLabel(String(data.roleAnterior))} para ${getRoleLabel(data.role)}.`,
      );
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

  const liberarAcessoMutation = useMutation({
    mutationFn: (payload?: LiberarUsuarioAcessoPayload) =>
      liberarUsuarioAcesso(instrutorId, payload),
    onSuccess: (response) => {
      const data = response.data;
      queryClient.setQueryData<GetInstrutorResponse | undefined>(
        queryKey,
        (previous) => {
          if (!previous?.data) return previous;
          return {
            ...previous,
            data: {
              ...previous.data,
              status: data.status,
              emailVerificado: data.emailVerificado,
              emailVerificadoEm: data.emailVerificadoEm,
            },
          };
        },
      );

      void invalidateInstrutor();
      invalidateUsuarios(queryClient);
      void queryClient.invalidateQueries({
        queryKey: ["usuarios", "historico", instrutorId],
        exact: false,
      });

      toastCustom.success(
        data.alreadyVerified
          ? "A conta foi ativada com o e-mail já verificado."
          : "Acesso do instrutor liberado com sucesso.",
      );
    },
  });

  const currentUserRole = user?.role?.toUpperCase() ?? null;
  const availableRoleTransitions = useMemo(
    () =>
      getAvailableRoleTransitions(
        currentUserRole,
        instrutorData?.role,
        user?.id ?? null,
        instrutorData?.id ?? null,
      ),
    [currentUserRole, instrutorData?.id, instrutorData?.role, user?.id],
  );
  const canAlterarFuncao =
    !!instrutorData &&
    availableRoleTransitions.some((role) => role !== instrutorData.role);
  const canLiberarAcesso = useMemo(() => {
    if (!instrutorData || !currentUserRole) return false;
    if (instrutorData.status?.toUpperCase() !== "PENDENTE") return false;

    return (
      currentUserRole === "ADMIN" ||
      currentUserRole === "MODERADOR" ||
      currentUserRole === "PEDAGOGICO" ||
      currentUserRole === "SETOR_DE_VAGAS"
    );
  }, [currentUserRole, instrutorData]);

  const handleAlterarFuncao = useCallback(
    async (payload: UpdateUsuarioRolePayload) => {
      try {
        await alterarFuncaoMutation.mutateAsync(payload);
      } catch (error: any) {
        const code = error?.response?.data?.code;
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Não foi possível alterar a função do instrutor.";

        if (code === "FORBIDDEN_SELF_ROLE_CHANGE") {
          toastCustom.error("Você não pode alterar a própria função.");
          throw error;
        }
        if (code === "FORBIDDEN_USER_ROLE") {
          toastCustom.error(
            "Você não tem permissão para aplicar essa função a este usuário.",
          );
          throw error;
        }
        if (code === "USER_ROLE_UPDATE_BLOCKED") {
          toastCustom.error(
            "Essa alteração de função precisa de outro fluxo administrativo.",
          );
          throw error;
        }
        if (code === "INVALID_ROLE_FOR_USER_TYPE") {
          toastCustom.error(
            message ||
              "A função selecionada é incompatível com o tipo de usuário.",
          );
          throw error;
        }

        toastCustom.error(message);
        throw error;
      }
    },
    [alterarFuncaoMutation],
  );

  const handleLiberarAcesso = useCallback(
    async (payload?: LiberarUsuarioAcessoPayload) => {
      try {
        await liberarAcessoMutation.mutateAsync(payload);
      } catch (error: any) {
        const code = error?.response?.data?.code;
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Não foi possível liberar o acesso do instrutor.";

        if (code === "FORBIDDEN_USER_ROLE") {
          toastCustom.error(
            "Você não tem permissão para liberar acesso deste tipo de usuário.",
          );
          throw error;
        }

        if (code === "USER_ACCESS_RELEASE_BLOCKED_BY_STATUS") {
          toastCustom.error(
            "Esse instrutor precisa de outro fluxo administrativo para voltar a acessar.",
          );
          throw error;
        }

        toastCustom.error(message);
        throw error;
      }
    },
    [liberarAcessoMutation],
  );

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
        onAlterarFuncaoInstrutor={
          canAlterarFuncao ? () => setIsAlterarFuncaoOpen(true) : undefined
        }
        onLiberarAcessoInstrutor={
          canLiberarAcesso ? () => setIsLiberarAcessoOpen(true) : undefined
        }
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
                obs ? { observacoes: obs } : undefined,
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

          <AlterarFuncaoUsuarioModal
            isOpen={isAlterarFuncaoOpen}
            onOpenChange={setIsAlterarFuncaoOpen}
            usuarioNome={instrutorData.nomeCompleto}
            usuarioEmail={instrutorData.email}
            tipoUsuario={instrutorData.tipoUsuario}
            roleAtual={instrutorData.role}
            availableRoles={availableRoleTransitions}
            onConfirm={handleAlterarFuncao}
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

          <LiberarAcessoUsuarioModal
            isOpen={isLiberarAcessoOpen}
            onOpenChange={setIsLiberarAcessoOpen}
            usuarioNome={instrutorData.nomeCompleto}
            usuarioEmail={instrutorData.email}
            onConfirm={handleLiberarAcesso}
          />
        </>
      )}
    </div>
  );
}
