"use client";

import { useMemo, useState, useCallback } from "react";
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
  getUsuarioById,
  liberarUsuarioAcesso,
  updateUsuarioRole,
  updateUsuario,
  createUsuarioBloqueio,
  revokeUsuarioBloqueio,
} from "@/api/usuarios";
import type {
  GetUsuarioResponse,
  UpdateUsuarioPayload,
  Role,
  CreateUsuarioBloqueioPayload,
  LiberarUsuarioAcessoPayload,
  RevokeUsuarioBloqueioPayload,
  UpdateUsuarioRolePayload,
} from "@/api/usuarios/types";
import { toastCustom } from "@/components/ui/custom/toast";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { invalidateUsuarios } from "@/lib/react-query/invalidation";
import { useAuth } from "@/hooks/useAuth";
import { getRoleLabel } from "@/config/roles";
import { HeaderInfo } from "./components";
import {
  AboutTab,
  CurriculosTab,
  CandidaturasTab,
  CursosInscricoesTab,
  HistoryTab,
} from "./tabs";
import {
  AlterarFuncaoUsuarioModal,
  BloquearUsuarioModal,
  DesbloquearUsuarioModal,
  EditarUsuarioModal,
  EditarUsuarioEnderecoModal,
  LiberarEmailUsuarioModal as LiberarAcessoUsuarioModal,
  ResetarSenhaUsuarioModal,
} from "./modal-acoes";
import type { UsuarioDetailsData, UsuarioDetailsViewProps } from "./types";

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
  (role) => !MODERADOR_BLOCKED_ROLES.includes(role)
);
const PEDAGOGICO_ALLOWED_ROLES: Role[] = ["ALUNO_CANDIDATO", "INSTRUTOR"];

function getAvailableRoleTransitions(
  actorRole: string | null,
  targetRole: Role | undefined,
  actorUserId?: string | null,
  targetUserId?: string | null
): Role[] {
  if (!actorRole || !targetRole) return [];
  if (actorUserId && targetUserId && actorUserId === targetUserId) return [];

  switch (actorRole) {
    case "ADMIN":
      return ALL_MANAGEABLE_ROLES;

    case "MODERADOR": {
      if (MODERADOR_BLOCKED_ROLES.includes(targetRole)) {
        return [];
      }

      return MODERADOR_ALLOWED_ROLES;
    }

    case "PEDAGOGICO": {
      return PEDAGOGICO_ALLOWED_ROLES.includes(targetRole)
        ? PEDAGOGICO_ALLOWED_ROLES
        : [];
    }

    default:
      return [];
  }
}

export function UsuarioDetailsView({
  usuarioId,
  initialData,
}: UsuarioDetailsViewProps) {
  const { user } = useAuth();
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
  const currentUserRole = user?.role?.toUpperCase() ?? null;

  const invalidateUsuario = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditEnderecoOpen, setIsEditEnderecoOpen] = useState(false);
  const [isAlterarFuncaoOpen, setIsAlterarFuncaoOpen] = useState(false);
  const [isResetSenhaOpen, setIsResetSenhaOpen] = useState(false);
  const [isLiberarAcessoOpen, setIsLiberarAcessoOpen] = useState(false);
  const [isBloquearModalOpen, setIsBloquearModalOpen] = useState(false);
  const [isDesbloquearModalOpen, setIsDesbloquearModalOpen] = useState(false);

  const updateUsuarioMutation = useMutation({
    mutationFn: (payload: UpdateUsuarioPayload) => {
      // Log para debug (apenas em desenvolvimento)
      if (process.env.NODE_ENV === "development") {
        console.log("📋 Mutation - Atualizando usuário:", {
          usuarioId,
          payload,
        });
      }
      return updateUsuario(usuarioId, payload);
    },
    onSuccess: (response) => {
      // Atualiza os dados do usuário no cache
      queryClient.setQueryData(queryKey, response);
      // Invalida a query do usuário para garantir dados frescos
      void invalidateUsuario();
      // Invalida listagens para refletir mudanças
      invalidateUsuarios(queryClient);
    },
    onError: (error: any) => {
      console.error("❌ Erro na mutation de atualização:", error);
    },
  });

  const bloquearUsuarioMutation = useMutation({
    mutationFn: (payload: CreateUsuarioBloqueioPayload) =>
      createUsuarioBloqueio(usuarioId, payload),
    onSuccess: () => {
      void invalidateUsuario();
      // Invalida listagens para refletir mudanças de status
      invalidateUsuarios(queryClient);
    },
  });

  const desbloquearUsuarioMutation = useMutation({
    mutationFn: (payload?: RevokeUsuarioBloqueioPayload) =>
      revokeUsuarioBloqueio(usuarioId, payload),
    onSuccess: () => {
      void invalidateUsuario();
      // Invalida listagens para refletir mudanças de status
      invalidateUsuarios(queryClient);
    },
  });

  const alterarFuncaoMutation = useMutation({
    mutationFn: (payload: UpdateUsuarioRolePayload) =>
      updateUsuarioRole(usuarioId, payload),
    onSuccess: (response) => {
      const data = response.data;

      queryClient.setQueryData<GetUsuarioResponse | undefined>(
        queryKey,
        (previous) => {
          if (!previous?.usuario) return previous;

          return {
            ...previous,
            usuario: {
              ...previous.usuario,
              role: data.role,
              atualizadoEm:
                data.atualizadoEm ?? previous.usuario.atualizadoEm,
            },
          };
        }
      );

      void invalidateUsuario();
      invalidateUsuarios(queryClient);
      void queryClient.invalidateQueries({
        queryKey: ["usuarios", "historico", usuarioId],
        exact: false,
      });

      toastCustom.success(
        `Função alterada de ${getRoleLabel(String(data.roleAnterior))} para ${getRoleLabel(data.role)}.`
      );
    },
  });

  const liberarAcessoMutation = useMutation({
    mutationFn: (payload?: LiberarUsuarioAcessoPayload) =>
      liberarUsuarioAcesso(usuarioId, payload),
    onSuccess: (response) => {
      const data = response.data;

      queryClient.setQueryData<GetUsuarioResponse | undefined>(
        queryKey,
        (previous) => {
          if (!previous?.usuario) return previous;

          return {
            ...previous,
            usuario: {
              ...previous.usuario,
              status: data.status,
              emailVerificado: data.emailVerificado,
              emailVerificadoEm: data.emailVerificadoEm,
              UsuariosVerificacaoEmail: {
                verified: data.emailVerificado,
                verifiedAt: data.emailVerificadoEm,
                token: null,
                tokenExpiration: null,
                attempts: previous.usuario.UsuariosVerificacaoEmail?.attempts ?? 0,
                lastAttemptAt:
                  previous.usuario.UsuariosVerificacaoEmail?.lastAttemptAt ?? null,
              },
            },
          };
        }
      );

      void invalidateUsuario();
      invalidateUsuarios(queryClient);

      toastCustom.success(
        data.alreadyVerified
          ? "A conta foi ativada com o e-mail já verificado."
          : "Acesso do usuário liberado com sucesso."
      );
    },
  });

  // Movido para antes dos returns condicionais para evitar hook condicional
  const tabs: HorizontalTabItem[] = useMemo(() => {
    if (!usuarioData) return [];
    
    const baseTabs: HorizontalTabItem[] = [
      {
        value: "sobre",
        label: "Sobre",
        icon: "User",
        content: <AboutTab usuario={usuarioData} isLoading={isReloading} />,
      },
    ];

    // Verificar se o usuário tem vínculos (cursos ou currículos)
    const hasCursos = (usuarioData.cursosInscricoes?.length ?? 0) > 0;
    const hasCurriculos = (usuarioData.curriculos?.length ?? 0) > 0;
    const hasVinculos = hasCursos || hasCurriculos;

    // Adicionar tabs específicas por role apenas se tiver vínculos
    if (usuarioData.role === "ALUNO_CANDIDATO" && hasVinculos) {
      // Adicionar tab de currículos apenas se tiver currículos
      if (hasCurriculos) {
        baseTabs.push({
          value: "curriculos",
          label: "Currículos",
          icon: "FileText",
          content: (
            <CurriculosTab usuario={usuarioData} isLoading={isReloading} />
          ),
        });
      }

      // Adicionar tab de candidaturas apenas se tiver currículos (candidato)
      if (hasCurriculos) {
        baseTabs.push({
          value: "candidaturas",
          label: "Candidaturas",
          icon: "Briefcase",
          content: (
            <CandidaturasTab usuario={usuarioData} isLoading={isReloading} />
          ),
        });
      }

      // Adicionar tab de cursos apenas se tiver cursos
      if (hasCursos) {
        baseTabs.push({
          value: "cursos",
          label: "Inscrições em Cursos",
          icon: "GraduationCap",
          content: (
            <CursosInscricoesTab
              usuario={usuarioData}
              isLoading={isReloading}
            />
          ),
        });
        }
    }

    baseTabs.push({
      value: "historico",
      label: "Histórico",
      icon: "History",
      content: <HistoryTab usuario={usuarioData} isLoading={isReloading} />,
    });

    return baseTabs;
  }, [usuarioData, isReloading]);

  const canLiberarAcesso = useMemo(() => {
    if (!usuarioData || !currentUserRole) return false;

    const statusPendente = usuarioData.status?.toUpperCase() === "PENDENTE";

    if (!statusPendente) return false;

    if (currentUserRole === "ADMIN" || currentUserRole === "MODERADOR") {
      return true;
    }

    if (currentUserRole === "PEDAGOGICO") {
      return (
        usuarioData.role === "ALUNO_CANDIDATO" || usuarioData.role === "INSTRUTOR"
      );
    }

    return false;
  }, [currentUserRole, usuarioData]);

  const availableRoleTransitions = useMemo(
    () =>
      getAvailableRoleTransitions(
        currentUserRole,
        usuarioData?.role,
        user?.id ?? null,
        usuarioData?.id ?? null
      ),
    [currentUserRole, user?.id, usuarioData?.id, usuarioData?.role]
  );

  const canAlterarFuncao =
    !!usuarioData &&
    availableRoleTransitions.some((role) => role !== usuarioData.role);

  const handleAlterarFuncao = useCallback(
    async (payload: UpdateUsuarioRolePayload) => {
      try {
        await alterarFuncaoMutation.mutateAsync(payload);
      } catch (error: any) {
        const code = error?.response?.data?.code;
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Não foi possível alterar a função do usuário.";

        if (code === "FORBIDDEN_SELF_ROLE_CHANGE") {
          toastCustom.error("Você não pode alterar a própria função.");
          throw error;
        }

        if (code === "FORBIDDEN_USER_ROLE") {
          toastCustom.error(
            "Você não tem permissão para aplicar essa função a este usuário."
          );
          throw error;
        }

        if (code === "USER_ROLE_UPDATE_BLOCKED") {
          toastCustom.error(
            "Essa alteração de função precisa de outro fluxo administrativo."
          );
          throw error;
        }

        toastCustom.error(message);
        throw error;
      }
    },
    [alterarFuncaoMutation]
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
          "Não foi possível liberar o acesso do usuário.";

        if (code === "FORBIDDEN_USER_ROLE") {
          toastCustom.error(
            "O setor pedagógico só pode liberar alunos e instrutores."
          );
          throw error;
        }

        if (code === "USER_ACCESS_RELEASE_BLOCKED_BY_STATUS") {
          toastCustom.error(
            "Esse usuário precisa de outro fluxo administrativo para voltar a acessar."
          );
          throw error;
        }

        toastCustom.error(message);
        throw error;
      }
    },
    [liberarAcessoMutation]
  );

  if (isReloading) {
    return (
      <div className="space-y-8">
        {/* HeaderInfo Skeleton */}
        <div className="rounded-3xl border border-gray-200 bg-white px-6 py-6 sm:px-8 sm:py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              <Skeleton className="h-20 w-20 rounded-full shrink-0" />
              <div className="space-y-3">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
              <Skeleton className="h-10 w-24 rounded-full" />
              <Skeleton className="h-10 w-28 rounded-full" />
            </div>
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="space-y-6">
          {/* Tab Headers */}
          <div className="flex gap-4 border-b border-gray-200">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-36" />
          </div>

          {/* Tab Content */}
          <div className="grid gap-6 lg:grid-cols-[minmax(0,_7fr)_minmax(0,_3fr)]">
            <section className="rounded-2xl border border-gray-200/60 bg-white p-6">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6 mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </section>
            <aside className="space-y-4">
              <div className="rounded-2xl border border-gray-200/60 bg-white p-6">
                <div className="space-y-4">
                  {Array.from({ length: 6 }, (_, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <div className="flex flex-1 flex-col space-y-2">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
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
        onAlterarFuncaoUsuario={
          canAlterarFuncao ? () => setIsAlterarFuncaoOpen(true) : undefined
        }
        onResetSenha={() => setIsResetSenhaOpen(true)}
        onLiberarAcessoUsuario={
          canLiberarAcesso ? () => setIsLiberarAcessoOpen(true) : undefined
        }
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

          <AlterarFuncaoUsuarioModal
            isOpen={isAlterarFuncaoOpen}
            onOpenChange={setIsAlterarFuncaoOpen}
            usuarioNome={usuarioData.nomeCompleto}
            usuarioEmail={usuarioData.email}
            roleAtual={usuarioData.role}
            availableRoles={availableRoleTransitions}
            onConfirm={handleAlterarFuncao}
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

          <LiberarAcessoUsuarioModal
            isOpen={isLiberarAcessoOpen}
            onOpenChange={setIsLiberarAcessoOpen}
            usuarioNome={usuarioData.nomeCompleto}
            usuarioEmail={usuarioData.email}
            onConfirm={handleLiberarAcesso}
          />
        </>
      )}
    </div>
  );
}
