"use client";

import { useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { HorizontalTabs } from "@/components/ui/custom";
import type { HorizontalTabItem } from "@/components/ui/custom";
import type { Curso, CursoTurma } from "@/api/cursos";
import { getCursoById } from "@/api/cursos";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { HeaderInfo } from "./components/HeaderInfo";
import { AboutTab } from "./tabs/AboutTab";
import { TurmasTab } from "./tabs/TurmasTab";
import { HistoryTab } from "./tabs/HistoryTab";

type CursoDetails = Curso & {
  categoria?: { id: number; nome: string };
  subcategoria?: { id: number; nome: string };
  turmas?: CursoTurma[];
  turmasCount?: number;
};

interface CursoDetailsViewProps {
  cursoId: string;
  initialCurso: CursoDetails | null;
  initialError?: Error;
  auditoria?: any[];
}

const CURSO_QUERY_STALE_TIME = 5 * 60 * 1000;
const CURSO_QUERY_GC_TIME = 30 * 60 * 1000;

export function CursoDetailsView({
  cursoId,
  initialCurso,
  initialError,
  auditoria = [],
}: CursoDetailsViewProps) {
  const queryClient = useQueryClient();
  const queryKey = useMemo(
    () => queryKeys.cursos.detail(cursoId),
    [cursoId]
  );

  const {
    data: cursoData,
    status,
    error,
    isFetching,
    isLoading,
  } = useQuery<CursoDetails, Error>({
    queryKey,
    queryFn: () => getCursoById(cursoId),
    initialData: initialCurso ?? undefined,
    retry: initialError ? false : 3, // Não tenta novamente se já veio com erro do servidor
    enabled: !initialError, // Não tenta buscar se já há erro inicial
    staleTime: CURSO_QUERY_STALE_TIME,
    gcTime: CURSO_QUERY_GC_TIME,
  });

  const invalidateCurso = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  const curso = cursoData ?? initialCurso ?? null;
  const isPending = !initialCurso && !initialError && isLoading;
  const isReloading = isFetching && status === "success";
  const queryErrorMessage =
    status === "error" || initialError
      ? error?.message ?? initialError?.message ?? "Erro ao carregar detalhes do curso."
      : null;

  // Se há erro inicial e não há curso, mostra erro imediatamente
  if (initialError && !curso) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertDescription>
            {initialError.message || "Erro ao carregar detalhes do curso."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isPending && !curso) {
    return (
      <div className="space-y-6">
        <p className="text-sm text-gray-500">Carregando curso...</p>
      </div>
    );
  }

  if (!curso) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertDescription>
            {queryErrorMessage ?? "Curso não encontrado"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const aboutTabContent = <AboutTab curso={curso} isLoading={isReloading} />;

  const turmasTabContent = (
    <TurmasTab turmas={curso.turmas || []} cursoId={curso.id} />
  );

  const historyTabContent = (
    <HistoryTab auditoria={auditoria} isLoading={isReloading} />
  );

  const turmasCount = curso.turmasCount ?? curso.turmas?.length ?? 0;

  const tabs: HorizontalTabItem[] = [
    {
      value: "sobre",
      label: "Sobre",
      icon: "FileText",
      content: aboutTabContent,
    },
    {
      value: "turmas",
      label: "Turmas",
      icon: "Users",
      content: turmasTabContent,
      badge: turmasCount > 0 ? <span>{turmasCount}</span> : null,
    },
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
        curso={curso}
        onEditCurso={() => {
          void invalidateCurso();
        }}
      />

      <HorizontalTabs items={tabs} defaultValue="sobre" />
    </div>
  );
}

export default CursoDetailsView;
