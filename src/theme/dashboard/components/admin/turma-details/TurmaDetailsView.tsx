"use client";

import { useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { HorizontalTabs } from "@/components/ui/custom";
import type { HorizontalTabItem } from "@/components/ui/custom";
import type { CursoTurma, TurmaInscricao } from "@/api/cursos";
import { getTurmaById, listInscricoes } from "@/api/cursos";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { UserRole } from "@/config/roles";
import { useUserRole } from "@/hooks/useUserRole";
import { HeaderInfo } from "./components/HeaderInfo";
import { AboutTab } from "./tabs/AboutTab";
import { EstruturaTab } from "./tabs/EstruturaTab";
import { InscricoesTab } from "./tabs/InscricoesTab";
import { HistoryTab } from "./tabs/HistoryTab";

interface TurmaDetailsViewProps {
  cursoId: number;
  turmaId: string;
  initialTurma: CursoTurma | null;
  initialError?: Error;
  cursoNome?: string;
  auditoria?: any[];
}

const TURMA_QUERY_STALE_TIME = 5 * 60 * 1000;
const TURMA_QUERY_GC_TIME = 30 * 60 * 1000;

export function TurmaDetailsView({
  cursoId,
  turmaId,
  initialTurma,
  initialError,
  cursoNome,
  auditoria = [],
}: TurmaDetailsViewProps) {
  const queryClient = useQueryClient();
  const userRole = useUserRole();
  const queryKey = useMemo(
    () => queryKeys.turmas.detail(cursoId, turmaId),
    [cursoId, turmaId]
  );

  const {
    data: turmaData,
    status,
    error,
    isFetching,
    isLoading,
  } = useQuery<CursoTurma, Error>({
    queryKey,
    queryFn: () => getTurmaById(cursoId, turmaId),
    initialData: initialTurma ?? undefined,
    retry: initialError ? false : 3, // Não tenta novamente se já veio com erro do servidor
    enabled: !initialError, // Não tenta buscar se já há erro inicial
    staleTime: TURMA_QUERY_STALE_TIME,
    gcTime: TURMA_QUERY_GC_TIME,
  });

  // Resolve turma atual para usar no enabled da query de inscrições
  const turma = turmaData ?? initialTurma ?? null;

  // Buscar inscrições (apenas se houver turma)
  const inscricoesQuery = useQuery<TurmaInscricao[]>({
    queryKey: queryKeys.cursos.listInscricoes(cursoId, turmaId),
    queryFn: async () => {
      try {
        const result = await listInscricoes(cursoId, turmaId);
        // Log temporário para depuração
        if (process.env.NODE_ENV === "development") {
          console.log("📋 Inscrições encontradas (React Query):", {
            cursoId,
            turmaId,
            count: result?.length ?? 0,
            data: result,
          });
        }
        return result;
      } catch (error) {
        // Se for 404, retorna array vazio (função já trata isso, mas garantimos aqui também)
        const apiError = error as { status?: number };
        if (apiError?.status === 404) {
          if (process.env.NODE_ENV === "development") {
            console.warn("⚠️ 404 ao buscar inscrições, retornando array vazio:", {
              cursoId,
              turmaId,
            });
          }
          return [];
        }
        // Para outros erros, relança
        throw error;
      }
    },
    enabled: !!turma && !initialError, // Só busca inscrições se houver turma e não houver erro
    staleTime: 0, // Sempre busca dados frescos (sem cache)
    gcTime: TURMA_QUERY_GC_TIME,
    refetchOnMount: true, // Sempre refaz a busca ao montar
    refetchOnWindowFocus: true, // Refaz a busca ao focar na janela
    retry: (failureCount, error) => {
      // Não tenta novamente se for 404 (endpoint não existe ou não há inscrições)
      const apiError = error as { status?: number };
      if (apiError?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
  });

  const invalidateTurma = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey });
    await queryClient.invalidateQueries({
      queryKey: queryKeys.cursos.listInscricoes(cursoId, turmaId),
    });
  }, [queryClient, queryKey, cursoId, turmaId]);

  const isPending = !initialTurma && !initialError && isLoading;
  const isReloading = isFetching && status === "success";
  const queryErrorMessage =
    status === "error" || initialError
      ? error?.message ?? initialError?.message ?? "Erro ao carregar detalhes da turma."
      : null;

  // Se há erro inicial e não há turma, mostra erro imediatamente
  if (initialError && !turma) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertDescription>
            {initialError.message || "Erro ao carregar detalhes da turma."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isPending && !turma) {
    return (
      <div className="space-y-6">
        <p className="text-sm text-gray-500">Carregando turma...</p>
      </div>
    );
  }

  if (!turma) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertDescription>
            {queryErrorMessage ?? "Turma não encontrada"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const aboutTabContent = (
    <AboutTab
      turma={turma}
      cursoNome={cursoNome}
      isLoading={isReloading}
    />
  );

  const inscricoesTabContent = (
    <InscricoesTab
      inscricoes={
        inscricoesQuery.data ?? (inscricoesQuery.status === "error" ? [] : [])
      }
      isLoading={inscricoesQuery.isLoading || inscricoesQuery.isFetching}
    />
  );

  const historyTabContent = (
    <HistoryTab auditoria={auditoria} isLoading={isReloading} />
  );

  const inscricoesCount = inscricoesQuery.data?.length ?? 0;
  const canViewEstrutura =
    userRole != null
      ? [UserRole.ADMIN, UserRole.MODERADOR, UserRole.PEDAGOGICO].includes(
          userRole
        )
      : false;

  const tabs: HorizontalTabItem[] = [
    {
      value: "sobre",
      label: "Sobre",
      icon: "FileText",
      content: aboutTabContent,
    },
    {
      value: "inscricoes",
      label: "Inscrições",
      icon: "Users",
      content: inscricoesTabContent,
      badge: inscricoesCount > 0 ? <span>{inscricoesCount}</span> : null,
    },
    ...(canViewEstrutura
      ? [
          {
            value: "estrutura",
            label: "Estrutura",
            icon: "Layers",
            content: (
              <EstruturaTab
                cursoId={cursoId}
                turmaId={turmaId}
                initialEstrutura={turma.estrutura ?? null}
                estruturaTipo={turma.estruturaTipo ?? null}
              />
            ),
          } as HorizontalTabItem,
        ]
      : []),
    {
      value: "historico",
      label: "Histórico",
      icon: "History",
      content: historyTabContent,
    },
  ];

  return (
    <div className="space-y-8">
      {queryErrorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{queryErrorMessage}</AlertDescription>
        </Alert>
      )}

      <HeaderInfo
        turma={turma}
        cursoId={cursoId}
        cursoNome={cursoNome}
        onEditTurma={() => {
          void invalidateTurma();
        }}
      />

      <HorizontalTabs items={tabs} defaultValue="sobre" />
    </div>
  );
}

export default TurmaDetailsView;
