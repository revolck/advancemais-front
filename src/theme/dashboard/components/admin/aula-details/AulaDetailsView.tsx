"use client";

import { useMemo, useCallback, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { HorizontalTabs } from "@/components/ui/custom";
import type { HorizontalTabItem } from "@/components/ui/custom";
import type { Aula } from "@/api/aulas";
import { getAulaById } from "@/api/aulas";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { HeaderInfo } from "./components/HeaderInfo";
import { AulasAlertasUnificados } from "./components/AulasAlertasUnificados";
import { AboutTab } from "./tabs/AboutTab";
import { useAuth } from "@/hooks/useAuth";
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
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => queryKeys.aulas.detail(aulaId), [aulaId]);

  const {
    data: aulaData,
    status,
    error,
    isFetching,
    isLoading,
    refetch,
  } = useQuery<Aula, Error>({
    queryKey,
    // Usar noCache para garantir dados frescos após edições
    queryFn: () => getAulaById(aulaId, undefined, { noCache: true }),
    initialData: initialAula ?? undefined,
    retry: initialError ? false : 3,
    enabled: !initialError,
    staleTime: 0, // Sempre considerar stale para garantir dados atualizados após edição
    gcTime: AULA_QUERY_GC_TIME,
    refetchOnMount: "always", // Sempre refetch quando o componente montar
    refetchOnWindowFocus: true, // Refetch quando a janela receber foco
  });

  // Forçar refetch quando houver parâmetro refresh na URL (vindo da edição)
  // Usar useState para garantir que só execute no cliente
  const [hasCheckedRefresh, setHasCheckedRefresh] = useState(false);

  useEffect(() => {
    // Só executar no cliente
    if (typeof window === "undefined" || hasCheckedRefresh) return;

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("refresh")) {
      setHasCheckedRefresh(true);

      // Remover parâmetro da URL sem recarregar a página
      urlParams.delete("refresh");
      const newUrl = `${window.location.pathname}${
        urlParams.toString() ? `?${urlParams.toString()}` : ""
      }`;
      window.history.replaceState({}, "", newUrl);

      // Forçar refetch dos dados
      refetch();
    }
  }, [refetch, hasCheckedRefresh]);

  const invalidateAula = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  const aula = aulaData ?? initialAula ?? null;
  const isPending = !initialAula && !initialError && isLoading;
  // isReloading: quando há dados iniciais mas está fazendo refetch para atualizar
  const isReloading = isFetching && initialAula && status !== "error";
  // Mostrar skeleton se estiver carregando E não houver dados válidos ainda
  // OU se estiver fazendo refetch (isReloading) para garantir que os dados sejam atualizados antes de mostrar
  const shouldShowSkeleton =
    ((isLoading || isFetching) && !aula && !initialError) ||
    (isReloading && !aulaData);

  // Debug: log dos dados recebidos
  useEffect(() => {
    if (aula) {
      console.log("[AulaDetailsView] Dados da aula recebidos:", {
        id: aula.id,
        titulo: aula.titulo,
        descricao: aula.descricao,
        descricaoLength: aula.descricao?.length || 0,
        descricaoType: typeof aula.descricao,
        descricaoIsEmpty: !aula.descricao || aula.descricao.trim() === "",
        modalidade: aula.modalidade,
        turma: aula.turma,
        instrutor: aula.instrutor,
        dataInicio: aula.dataInicio,
        dataFim: aula.dataFim,
        horaInicio: aula.horaInicio,
        horaFim: aula.horaFim,
        duracaoMinutos: aula.duracaoMinutos,
        status: aula.status,
      });
    }
  }, [aula]);
  const queryErrorMessage =
    status === "error" || initialError
      ? error?.message ??
        initialError?.message ??
        "Erro ao carregar detalhes da aula."
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

  // Skeleton completo enquanto carrega
  if (shouldShowSkeleton) {
    return (
      <div className="space-y-8">
        {/* Breadcrumb skeleton */}
        <Skeleton className="h-4 w-64" />

        {/* Alert skeleton */}
        <Skeleton className="h-20 w-full rounded-lg" />

        {/* Header skeleton */}
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
          <div className="relative flex flex-col gap-6 px-6 py-6 sm:px-8 sm:py-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1 min-w-0 space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-20" />
            </div>
          </div>
        </div>

        {/* Tabs skeleton */}
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
          <div className="p-6 sm:p-7">
            {/* Tabs header skeleton */}
            <div className="flex gap-2 mb-6">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-9 w-28" />
            </div>

            {/* Content skeleton */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-[minmax(0,_7fr)_minmax(0,_3fr)]">
              {/* Main content skeleton */}
              <div className="space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-5/6" />
                <Skeleton className="h-6 w-4/6" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />
              </div>

              {/* Sidebar skeleton */}
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
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

  const aboutTabContent = (
    <AboutTab
      aula={aula}
      isLoading={isReloading ?? false}
      onUpdate={invalidateAula}
    />
  );

  const materiaisTabContent = <MateriaisTab aulaId={aula.id} />;

  const historicoTabContent = (
    <HistoricoTab aulaId={aula.id} isLoading={isReloading ?? false} />
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

      {/* Alertas unificados */}
      {!isReloading && aula && <AulasAlertasUnificados aula={aula} />}

      {/* Só mostrar conteúdo se não estiver recarregando */}
      {!isReloading ? (
        <>
          <HeaderInfo aula={aula} onUpdate={invalidateAula} />
          <HorizontalTabs items={tabs} defaultValue="sobre" />
        </>
      ) : (
        // Skeleton durante reload
        <>
          {/* Header skeleton */}
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
            <div className="relative flex flex-col gap-6 px-6 py-6 sm:px-8 sm:py-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1 min-w-0 space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-6 w-32" />
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-20" />
              </div>
            </div>
          </div>

          {/* Tabs skeleton */}
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
            <div className="p-6 sm:p-7">
              {/* Tabs header skeleton */}
              <div className="flex gap-2 mb-6">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-32" />
                <Skeleton className="h-9 w-28" />
              </div>

              {/* Content skeleton */}
              <div className="grid gap-6 grid-cols-1 lg:grid-cols-[minmax(0,_7fr)_minmax(0,_3fr)]">
                {/* Main content skeleton */}
                <div className="space-y-4">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-5/6" />
                  <Skeleton className="h-6 w-4/6" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-3/4" />
                </div>

                {/* Sidebar skeleton */}
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-5 w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AulaDetailsView;
