"use client";

import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
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
  getCursoAlunoDetalhes,
  updateCursoAluno,
} from "@/api/cursos";
import type { CursoAlunoDetalhesResponse } from "@/api/cursos/types";
import {
  createAlunoBloqueio,
  revokeAlunoBloqueio,
} from "@/api/usuarios";
import { HeaderInfo } from "./components";
import {
  AboutTab,
  CursosTurmasTab,
  CurriculosTab,
  CandidaturasTab,
  EntrevistasTab,
  NotasTab,
  FrequenciaTab,
  EstagiosTab,
} from "./tabs";
import {
  BloquearAlunoModal,
  DesbloquearAlunoModal,
  EditarAlunoModal,
  EditarAlunoEnderecoModal,
  ResetarSenhaAlunoModal,
  type BloquearAlunoData,
} from "./modal-acoes";
import type { AlunoDetailsData, AlunoDetailsViewProps } from "./types";

const ALUNO_QUERY_STALE_TIME = 30 * 1000;
const ALUNO_QUERY_GC_TIME = 30 * 60 * 1000;

const buildAlunoQueryKey = (alunoId: string) =>
  ["admin-course-student", alunoId] as const;

export function AlunoDetailsView({
  alunoId,
  initialData,
}: AlunoDetailsViewProps) {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const queryKey = useMemo(
    () => buildAlunoQueryKey(alunoId),
    [alunoId]
  );

  const initialQueryData = useMemo<CursoAlunoDetalhesResponse>(
    () => ({
      success: true,
      data: initialData,
    }),
    [initialData]
  );

  const {
    data: alunoResponse,
    error: queryError,
    status,
    isFetching,
    isLoading,
  } = useQuery<CursoAlunoDetalhesResponse>({
    queryKey,
    queryFn: () => getCursoAlunoDetalhes(alunoId),
    initialData: initialQueryData,
    staleTime: ALUNO_QUERY_STALE_TIME,
    gcTime: ALUNO_QUERY_GC_TIME,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const alunoData = alunoResponse?.data ?? null;
  const alunoNome = alunoData?.nome || alunoData?.nomeCompleto || "Aluno";
  const inscricoes = alunoData?.inscricoes ?? [];
  const hasCurriculos = (alunoData?.curriculosResumo?.total ?? 0) > 0;
  const hasInscricaoEmCurso = inscricoes.some(
    (inscricao) => Boolean(inscricao?.curso?.id || inscricao?.turma?.id),
  );

  const isPending = !initialData && isLoading;
  const queryErrorMessage =
    status === "error"
      ? (queryError as Error | null)?.message ??
        "Não foi possível carregar os dados do aluno."
      : null;
  const isReloading = isFetching && !isLoading;

  const invalidateAluno = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  const updateAlunoMutation = useMutation({
    mutationFn: (payload: Partial<AlunoDetailsData>) =>
      updateCursoAluno(alunoId, payload),
    onSuccess: (response) => {
      // Preserva as inscrições existentes se a resposta não as incluir ou se vierem vazias
      const currentData = queryClient.getQueryData<CursoAlunoDetalhesResponse>(
        queryKey
      );
      
      // Verifica se a resposta tem inscrições válidas
      const responseHasInscricoes =
        Array.isArray(response?.data?.inscricoes) &&
        response.data.inscricoes.length > 0;
      
      // Obtém inscrições existentes do cache
      const currentInscricoes =
        Array.isArray(currentData?.data?.inscricoes) &&
        currentData.data.inscricoes.length > 0
          ? currentData.data.inscricoes
          : null;

      // Se a resposta não tem inscrições ou está vazia, preserva as existentes
      const mergedResponse: CursoAlunoDetalhesResponse = {
        ...response,
        data: {
          ...response.data,
          // Prioriza inscrições da resposta se existirem, senão preserva as do cache
          inscricoes: responseHasInscricoes
            ? response.data.inscricoes
            : currentInscricoes ?? response.data.inscricoes ?? [],
          // Atualiza totalInscricoes baseado nas inscrições finais
          totalInscricoes: responseHasInscricoes
            ? response.data.totalInscricoes ?? response.data.inscricoes.length
            : currentInscricoes?.length ??
              response.data.totalInscricoes ??
              0,
        },
      };

      queryClient.setQueryData(queryKey, mergedResponse);
    },
  });

  const bloquearAlunoMutation = useMutation({
    mutationFn: (payload: BloquearAlunoData) =>
      createAlunoBloqueio(alunoId, payload),
  });

  const desbloquearAlunoMutation = useMutation({
    mutationFn: (payload?: { observacoes?: string }) =>
      revokeAlunoBloqueio(alunoId, payload),
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditEnderecoOpen, setIsEditEnderecoOpen] = useState(false);
  const [isResetSenhaOpen, setIsResetSenhaOpen] = useState(false);
  const [isBloquearModalOpen, setIsBloquearModalOpen] = useState(false);
  const [isDesbloquearModalOpen, setIsDesbloquearModalOpen] = useState(false);

  if (isPending && !alunoData) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Carregando dados do aluno...</span>
        </div>
      </div>
    );
  }

  if (!alunoData) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {queryErrorMessage ??
              "Não foi possível carregar os dados do aluno."}
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
      content: <AboutTab aluno={alunoData} isLoading={isReloading} />,
    },
    {
      value: "cursos-turmas",
      label: "Cursos/Turmas",
      icon: "Layers",
      content: (
        <CursosTurmasTab
          aluno={alunoData}
          inscricoes={inscricoes}
          isLoading={isReloading}
        />
      ),
    },
    {
      value: "curriculos",
      label: "Currículos",
      icon: "FileText",
      content: (
        <CurriculosTab aluno={alunoData} isLoading={isReloading} />
      ),
    },
    {
      value: "candidaturas",
      label: "Candidaturas",
      icon: "Briefcase",
      content: (
        <CandidaturasTab aluno={alunoData} isLoading={isReloading} />
      ),
    },
    ...(hasCurriculos
      ? [
          {
            value: "entrevistas",
            label: "Entrevistas",
            icon: "CalendarDays",
            content: (
              <EntrevistasTab aluno={alunoData} isLoading={isReloading} />
            ),
          } satisfies HorizontalTabItem,
        ]
      : []),
    ...(hasInscricaoEmCurso
      ? [
          {
            value: "notas",
            label: "Notas",
            icon: "GraduationCap",
            content: (
              <NotasTab
                aluno={alunoData}
                inscricoes={inscricoes}
                isLoading={isReloading}
              />
            ),
          } satisfies HorizontalTabItem,
          {
            value: "frequencia",
            label: "Frequência",
            icon: "CalendarDays",
            content: (
              <FrequenciaTab
                aluno={alunoData}
                inscricoes={inscricoes}
                isLoading={isReloading}
              />
            ),
          } satisfies HorizontalTabItem,
        ]
      : []),
    ...(hasInscricaoEmCurso
      ? [
          {
            value: "estagios",
            label: "Estágios",
            icon: "Briefcase",
            content: (
              <EstagiosTab
                aluno={alunoData}
                inscricoes={inscricoes}
                isLoading={isReloading}
              />
            ),
          } satisfies HorizontalTabItem,
        ]
      : []),
  ];

  const tabFromUrl = searchParams.get("tab");
  const defaultTabValue =
    tabFromUrl && tabs.some((tab) => tab.value === tabFromUrl)
      ? tabFromUrl
      : "sobre";

  return (
    <div className="space-y-8">
      {queryErrorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{queryErrorMessage}</AlertDescription>
        </Alert>
      )}

      <HeaderInfo
        aluno={alunoData}
        onEditAluno={() => setIsEditModalOpen(true)}
        onEditEndereco={() => setIsEditEnderecoOpen(true)}
        onResetSenha={() => setIsResetSenhaOpen(true)}
        onBloquearAluno={() => setIsBloquearModalOpen(true)}
        onDesbloquearAluno={() => setIsDesbloquearModalOpen(true)}
      />

      <HorizontalTabs items={tabs} defaultValue={defaultTabValue} />

      <EditarAlunoModal
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        aluno={alunoData}
        onConfirm={async (data) => {
          await updateAlunoMutation.mutateAsync(data);
        }}
      />

      <BloquearAlunoModal
        isOpen={isBloquearModalOpen}
        onOpenChange={setIsBloquearModalOpen}
        alunoNome={alunoNome}
        onConfirm={async (payload) => {
          await bloquearAlunoMutation.mutateAsync(payload);
          await invalidateAluno();
        }}
      />

      <DesbloquearAlunoModal
        isOpen={isDesbloquearModalOpen}
        onOpenChange={setIsDesbloquearModalOpen}
        alunoNome={alunoNome}
        onConfirm={async (obs) => {
          await desbloquearAlunoMutation.mutateAsync(
            obs ? { observacoes: obs } : undefined
          );
          await invalidateAluno();
        }}
      />

      <EditarAlunoEnderecoModal
        isOpen={isEditEnderecoOpen}
        onOpenChange={setIsEditEnderecoOpen}
        aluno={alunoData}
        onConfirm={async (endereco) => {
          await updateAlunoMutation.mutateAsync(endereco as any);
        }}
      />

      <ResetarSenhaAlunoModal
        isOpen={isResetSenhaOpen}
        onOpenChange={setIsResetSenhaOpen}
        email={alunoData.email}
        allowManual={true}
        onManualSubmit={async (senha, confirmarSenha) => {
          await updateAlunoMutation.mutateAsync(
            { senha, confirmarSenha } as any
          );
        }}
      />
    </div>
  );
}
