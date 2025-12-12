"use client";

import { useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { HorizontalTabs } from "@/components/ui/custom";
import type { HorizontalTabItem } from "@/components/ui/custom";
import type { Aula } from "@/api/aulas";
import { getAulaById } from "@/api/aulas";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { HeaderInfo } from "./components/HeaderInfo";
import { AboutTab } from "./tabs/AboutTab";
import { HistoricoTab } from "./tabs/HistoricoTab";
import { MateriaisTab } from "./tabs/MateriaisTab";

interface AulaDetailsViewProps {
  aulaId: string;
  initialAula: Aula | null;
  initialError?: Error;
}

const AULA_QUERY_STALE_TIME = 5 * 60 * 1000; // 5 minutos
const AULA_QUERY_GC_TIME = 30 * 60 * 1000; // 30 minutos

export function AulaDetailsView({
  aulaId,
  initialAula,
  initialError,
}: AulaDetailsViewProps) {
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => queryKeys.aulas.detail(aulaId), [aulaId]);

  const {
    data: aulaData,
    status,
    error,
    isFetching,
    isLoading,
  } = useQuery<Aula, Error>({
    queryKey,
    queryFn: () => getAulaById(aulaId),
    initialData: initialAula ?? undefined,
    retry: initialError ? false : 3,
    enabled: !initialError,
    staleTime: AULA_QUERY_STALE_TIME,
    gcTime: AULA_QUERY_GC_TIME,
  });

  const invalidateAula = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  const aula = aulaData ?? initialAula ?? null;
  const isPending = !initialAula && !initialError && isLoading;
  const isReloading = isFetching && status === "success";
  const queryErrorMessage =
    status === "error" || initialError
      ? (error?.message ??
        initialError?.message ??
        "Erro ao carregar detalhes da aula.")
      : null;

  // Se há erro inicial e não há aula, mostra erro imediatamente
  if (initialError && !aula) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertDescription>
            {initialError.message || "Erro ao carregar detalhes da aula."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isPending && !aula) {
    return (
      <div className="space-y-6">
        <p className="text-sm text-gray-500">Carregando aula...</p>
      </div>
    );
  }

  if (!aula) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertDescription>
            {queryErrorMessage ?? "Aula não encontrada"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const aboutTabContent = <AboutTab aula={aula} isLoading={isReloading} onUpdate={invalidateAula} />;

  const materiaisTabContent = <MateriaisTab aulaId={aula.id} />;

  const historicoTabContent = (
    <HistoricoTab aulaId={aula.id} isLoading={isReloading} />
  );

  const tabs: HorizontalTabItem[] = [
    {
      value: "sobre",
      label: "Sobre",
      icon: "FileText",
      content: aboutTabContent,
    },
    {
      value: "materiais",
      label: "Materiais",
      icon: "Paperclip",
      content: materiaisTabContent,
    },
    {
      value: "historico",
      label: "Histórico",
      icon: "History",
      content: historicoTabContent,
    },
  ];

  return (
    <div className="space-y-8">
      {queryErrorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{queryErrorMessage}</AlertDescription>
        </Alert>
      )}

      <HeaderInfo aula={aula} onUpdate={invalidateAula} />

      <HorizontalTabs items={tabs} defaultValue="sobre" />
    </div>
  );
}

export default AulaDetailsView;
