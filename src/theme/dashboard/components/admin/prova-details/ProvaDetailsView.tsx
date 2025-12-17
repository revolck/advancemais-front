"use client";

import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { HorizontalTabs } from "@/components/ui/custom";
import type { HorizontalTabItem } from "@/components/ui/custom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getProvaById, type TurmaProva } from "@/api/cursos";
import { HeaderInfo } from "./components/HeaderInfo";
import { QuestoesTab } from "./tabs/QuestoesTab";
import { RespostasTab } from "./tabs/RespostasTab";
import { TokensTab } from "./tabs/TokensTab";

interface ProvaDetailsViewProps {
  cursoId: number | string;
  turmaId: string;
  provaId: string;
  initialProva?: TurmaProva | null;
  initialError?: Error;
}

const PROVA_QUERY_STALE_TIME = 5 * 60 * 1000; // 5 minutos
const PROVA_QUERY_GC_TIME = 30 * 60 * 1000; // 30 minutos

export function ProvaDetailsView({
  cursoId,
  turmaId,
  provaId,
  initialProva,
  initialError,
}: ProvaDetailsViewProps) {
  const {
    data: provaData,
    status,
    error,
    isFetching,
    isLoading,
  } = useQuery<TurmaProva, Error>({
    queryKey: ["prova", cursoId, turmaId, provaId],
    queryFn: () => getProvaById(cursoId, turmaId, provaId),
    initialData: initialProva ?? undefined,
    retry: initialError ? false : 3,
    enabled: !initialError,
    staleTime: PROVA_QUERY_STALE_TIME,
    gcTime: PROVA_QUERY_GC_TIME,
  });

  const prova = provaData ?? initialProva ?? null;

  const tabs: HorizontalTabItem[] = useMemo(
    () => [
      {
        value: "questoes",
        label: "Questões",
        content: prova ? (
          <QuestoesTab cursoId={cursoId} turmaId={turmaId} provaId={provaId} />
        ) : (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ),
      },
      {
        value: "respostas",
        label: "Respostas",
        content: prova ? (
          <RespostasTab cursoId={cursoId} turmaId={turmaId} provaId={provaId} />
        ) : (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ),
      },
      {
        value: "tokens",
        label: "Tokens Únicos",
        icon: "Key",
        content: prova ? (
          <TokensTab cursoId={cursoId} turmaId={turmaId} provaId={provaId} />
        ) : (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ),
      },
    ],
    [cursoId, turmaId, provaId, prova]
  );

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
      <HeaderInfo prova={prova} cursoId={cursoId} turmaId={turmaId} />

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <HorizontalTabs
          items={tabs}
          defaultValue="questoes"
          className="w-full"
          listClassName="border-b border-gray-200 px-6"
          contentClassName="p-6"
        />
      </div>
    </div>
  );
}
