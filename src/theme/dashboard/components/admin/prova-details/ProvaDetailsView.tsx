"use client";

import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { HorizontalTabs } from "@/components/ui/custom";
import type { HorizontalTabItem } from "@/components/ui/custom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getProvaById, type TurmaProva } from "@/api/cursos";
import { listAvaliacaoRespostas } from "@/api/provas";
import { HeaderInfo } from "./components/HeaderInfo";
import { AvaliacaoAlertasUnificados } from "./components/AvaliacaoAlertasUnificados";
import { AboutTab } from "./tabs/AboutTab";
import { QuestoesTab } from "./tabs/QuestoesTab";
import { QuestoesReadonlyTab } from "./tabs/QuestoesReadonlyTab";
import { RespostasTab } from "./tabs/RespostasTab";
import { HistoryTab } from "./tabs/HistoryTab";
import { canManageQuestoes } from "./utils/validations";
import { useAuth } from "@/hooks/useAuth";

interface ProvaDetailsViewProps {
  cursoId: number | string | null;
  turmaId: string | null;
  provaId: string;
  initialProva?: TurmaProva | null;
  initialError?: Error;
}

const PROVA_QUERY_STALE_TIME = 30 * 1000; // 30 segundos
const PROVA_QUERY_GC_TIME = 30 * 60 * 1000; // 30 minutos

export function ProvaDetailsView({
  cursoId,
  turmaId,
  provaId,
  initialProva,
  initialError,
}: ProvaDetailsViewProps) {
  const { user } = useAuth();
  const hasContext = Boolean(cursoId) && Boolean(turmaId);
  const cursoIdWithContext = cursoId as number | string;
  const turmaIdWithContext = turmaId as string;

  const {
    data: provaData,
    status,
    error,
    isFetching,
    isLoading,
  } = useQuery<TurmaProva, Error>({
    queryKey: ["prova", cursoId, turmaId, provaId],
    queryFn: () => getProvaById(cursoId!, turmaId!, provaId),
    initialData: initialProva ?? undefined,
    retry: initialError ? false : 3,
    enabled: !initialError && hasContext,
    staleTime: PROVA_QUERY_STALE_TIME,
    gcTime: PROVA_QUERY_GC_TIME,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const prova = provaData ?? initialProva ?? null;
  const { data: hasRespostas } = useQuery<boolean>({
    queryKey: ["avaliacao-respostas-count", provaId],
    queryFn: async () => {
      const response = await listAvaliacaoRespostas(provaId, {
        page: 1,
        pageSize: 1,
      });
      const total = Number(response.pagination?.total ?? response.data?.length ?? 0);
      return total > 0;
    },
    enabled: Boolean(provaId),
    staleTime: PROVA_QUERY_STALE_TIME,
    gcTime: PROVA_QUERY_GC_TIME,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const hasQuestoes = Boolean(
    prova && Array.isArray(prova.questoes) && prova.questoes.length > 0
  );
  const shouldShowQuestoesTab = Boolean(
    prova &&
      !(
        prova.tipo === "ATIVIDADE" &&
        (prova.tipoAtividade === "PERGUNTA_RESPOSTA" || prova.tipoAtividade === "TEXTO")
      )
  );
  const canManageQuestions = prova
    ? canManageQuestoes(prova, {
        hasRespostas,
        userRole: user?.role,
        userId: user?.id,
      })
    : false;

  const tabs: HorizontalTabItem[] = useMemo(() => {
    const baseTabs: HorizontalTabItem[] = [
      {
        value: "resumo",
        label: "Resumo",
        icon: "FileText",
        content: prova ? (
          <AboutTab prova={prova} />
        ) : (
          <div className="space-y-4">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-40 w-full" />
          </div>
        ),
      },
      {
        value: "respostas",
        label: "Respostas",
        icon: "Users",
        content: (
          <RespostasTab
            provaId={provaId}
            tipoAvaliacaoContext={(prova?.tipo as "PROVA" | "ATIVIDADE" | undefined) ?? null}
          />
        ),
      },
      {
        value: "historico",
        label: "Histórico",
        icon: "History",
        content: prova ? <HistoryTab prova={prova} /> : null,
      },
    ];

    if (shouldShowQuestoesTab) {
      baseTabs.splice(1, 0, {
        value: "questoes",
        label: "Questões",
        icon: "CheckSquare",
        content:
          prova && hasContext ? (
            <QuestoesTab
              cursoId={cursoIdWithContext}
              turmaId={turmaIdWithContext}
              provaId={provaId}
              allowQuestionManagement={canManageQuestions}
            />
          ) : (
            <QuestoesReadonlyTab
              avaliacaoId={provaId}
              questoes={hasQuestoes ? prova?.questoes : []}
            />
          ),
      });
    }

    return baseTabs;
  }, [
    provaId,
    prova,
    canManageQuestions,
    hasContext,
    hasQuestoes,
    cursoIdWithContext,
    turmaIdWithContext,
    shouldShowQuestoesTab,
  ]);

  if (status === "error" || initialError) {
    const errorMessage =
      error?.message || initialError?.message || "Erro ao carregar prova";
    return (
      <div className="space-y-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading && !prova) {
    return (
      <div className="space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!prova) {
    return (
      <div className="space-y-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Prova não encontrada</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AvaliacaoAlertasUnificados
        prova={prova}
        hasRespostas={hasRespostas}
        userRole={user?.role}
        userId={user?.id}
      />
      <HeaderInfo prova={prova} hasRespostas={hasRespostas} />
      <HorizontalTabs items={tabs} defaultValue={tabs[0]?.value ?? "resumo"} />
    </div>
  );
}
