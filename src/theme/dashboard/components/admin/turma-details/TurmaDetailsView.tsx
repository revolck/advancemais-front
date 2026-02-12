"use client";

import { useMemo, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { HorizontalTabs } from "@/components/ui/custom";
import type { HorizontalTabItem } from "@/components/ui/custom";
import type { CursoTurma, TurmaInscricao } from "@/api/cursos";
import { getTurmaById, listInscricoesCurso } from "@/api/cursos";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { UserRole } from "@/config/roles";
import { useUserRole } from "@/hooks/useUserRole";
import { HeaderInfo } from "./components/HeaderInfo";
import { AboutTab } from "./tabs/AboutTab";
import { EstruturaTab } from "./tabs/EstruturaTab";
import { InscricoesTab } from "./tabs/InscricoesTab";
import { HistoryTab } from "./tabs/HistoryTab";

interface TurmaDetailsViewProps {
  cursoId: number | string;
  turmaId: string;
  initialTurma: CursoTurma | null;
  initialError?: Error;
  cursoNome?: string;
}

const TURMA_QUERY_STALE_TIME = 20 * 1000;
const TURMA_QUERY_GC_TIME = 30 * 60 * 1000;
const INSCRICOES_PAGE_SIZE = 50;
const INSCRICOES_HISTORY_PAGE_SIZE = 200;
const INSCRICOES_HISTORY_FETCH_CONCURRENCY = 3;

interface InscricoesPagination {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface InscricoesQueryData {
  items: TurmaInscricao[];
  pagination: InscricoesPagination;
}

function mapInscricaoItemToTurmaInscricao(item: any): TurmaInscricao {
  return {
    id: String(item.id),
    alunoId: String(item.alunoId ?? item.aluno?.id ?? ""),
    status: item.statusInscricao ?? item.status,
    statusInscricao: item.statusInscricao ?? item.status,
    statusPagamento: item.statusPagamento,
    progresso: typeof item.progresso === "number" ? item.progresso : undefined,
    criadoEm: item.criadoEm,
    observacoes: item.observacoes,
    aluno: item.aluno
      ? {
          id: String(item.aluno.id ?? item.alunoId ?? ""),
          nome: item.aluno.nome,
          nomeCompleto: item.aluno.nomeCompleto,
          email: item.aluno.email,
          cpf: item.aluno.cpf,
          avatarUrl: item.aluno.avatarUrl,
          codigo: item.aluno.codigo,
          codUsuario: item.aluno.codUsuario,
        }
      : undefined,
    curso: item.curso
      ? {
          id: String(item.curso.id ?? ""),
          nome: item.curso.nome ?? "",
          codigo: item.curso.codigo ?? "",
        }
      : undefined,
  };
}

async function fetchInscricoesCursoPage(
  cursoId: number | string,
  turmaId: string,
  page: number,
  includeProgress: boolean,
  search?: string
): Promise<InscricoesQueryData> {
  const response = await listInscricoesCurso(cursoId, {
    turmaId,
    page,
    pageSize: INSCRICOES_PAGE_SIZE,
    ...(search ? { search } : {}),
    ...(includeProgress ? { includeProgress: true } : {}),
  });

  const items = (Array.isArray(response?.data) ? response.data : []).map(
    mapInscricaoItemToTurmaInscricao
  );
  const pagination = response?.pagination;
  return {
    items,
    pagination: {
      total: Math.max(0, Number(pagination?.total ?? items.length)),
      page: Math.max(1, Number(pagination?.page ?? page)),
      pageSize: Math.max(
        1,
        Number(pagination?.pageSize ?? INSCRICOES_PAGE_SIZE)
      ),
      totalPages: Math.max(1, Number(pagination?.totalPages ?? 1)),
    },
  };
}

async function fetchAllInscricoesForHistory(
  cursoId: number | string,
  turmaId: string
): Promise<TurmaInscricao[]> {
  const firstPage = await listInscricoesCurso(cursoId, {
    turmaId,
    page: 1,
    pageSize: INSCRICOES_HISTORY_PAGE_SIZE,
  });

  let items = Array.isArray(firstPage?.data) ? firstPage.data : [];
  const totalPages = Math.max(1, Number(firstPage?.pagination?.totalPages ?? 1));

  if (totalPages > 1) {
    for (
      let startPage = 2;
      startPage <= totalPages;
      startPage += INSCRICOES_HISTORY_FETCH_CONCURRENCY
    ) {
      const endPage = Math.min(
        startPage + INSCRICOES_HISTORY_FETCH_CONCURRENCY - 1,
        totalPages
      );
      const requests: Promise<any>[] = [];

      for (let page = startPage; page <= endPage; page += 1) {
        requests.push(
          listInscricoesCurso(cursoId, {
            turmaId,
            page,
            pageSize: INSCRICOES_HISTORY_PAGE_SIZE,
          })
        );
      }

      const responses = await Promise.all(requests);
      responses.forEach((response) => {
        if (Array.isArray(response?.data)) {
          items = items.concat(response.data);
        }
      });
    }
  }

  return items.map(mapInscricaoItemToTurmaInscricao);
}

export function TurmaDetailsView({
  cursoId,
  turmaId,
  initialTurma,
  initialError,
  cursoNome,
}: TurmaDetailsViewProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const userRole = useUserRole();
  const [activeTab, setActiveTab] = useState("sobre");
  const [inscricoesPage, setInscricoesPage] = useState(1);
  const [inscricoesSearch, setInscricoesSearch] = useState("");
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
  const inscricoesQuery = useQuery<InscricoesQueryData>({
    queryKey: [
      ...queryKeys.cursos.listInscricoes(cursoId, turmaId),
      "page",
      inscricoesPage,
      "search",
      inscricoesSearch,
    ],
    queryFn: async () => {
      try {
        const mapped = await fetchInscricoesCursoPage(
          cursoId,
          turmaId,
          inscricoesPage,
          false,
          inscricoesSearch
        );
        // Log temporário para depuração
        if (process.env.NODE_ENV === "development") {
          console.log("📋 Inscrições encontradas (React Query):", {
            cursoId,
            turmaId,
            page: inscricoesPage,
            count: mapped.items.length,
            data: mapped.items,
          });
        }
        return mapped;
      } catch (error) {
        // Se for 404, retorna array vazio (função já trata isso, mas garantimos aqui também)
        const apiError = error as { status?: number };
        if (apiError?.status === 404) {
          if (process.env.NODE_ENV === "development") {
            console.warn("⚠️ 404 ao buscar inscrições, retornando array vazio:", {
              cursoId,
              turmaId,
              page: inscricoesPage,
            });
          }
          return {
            items: [],
            pagination: {
              total: 0,
              page: inscricoesPage,
              pageSize: INSCRICOES_PAGE_SIZE,
              totalPages: 1,
            },
          };
        }
        // Para outros erros, relança
        throw error;
      }
    },
    enabled:
      !!turma &&
      !initialError &&
      activeTab === "inscricoes",
    staleTime: 15 * 1000,
    gcTime: TURMA_QUERY_GC_TIME,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Não tenta novamente se for 404 (endpoint não existe ou não há inscrições)
      const apiError = error as { status?: number };
      if (apiError?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
  });

  const inscricoesProgressQuery = useQuery<TurmaInscricao[]>({
    queryKey: [
      ...queryKeys.cursos.listInscricoes(cursoId, turmaId),
      "page",
      inscricoesPage,
      "search",
      inscricoesSearch,
      "progress",
    ],
    queryFn: async () =>
      (
        await fetchInscricoesCursoPage(
          cursoId,
          turmaId,
          inscricoesPage,
          true,
          inscricoesSearch
        )
      ).items,
    enabled: false,
    staleTime: 15 * 1000,
    gcTime: TURMA_QUERY_GC_TIME,
    retry: (failureCount, error) => {
      const apiError = error as { status?: number };
      if (apiError?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });

  const historyInscricoesQuery = useQuery<TurmaInscricao[]>({
    queryKey: [...queryKeys.cursos.listInscricoes(cursoId, turmaId), "history"],
    queryFn: async () => {
      try {
        return await fetchAllInscricoesForHistory(cursoId, turmaId);
      } catch (error) {
        const apiError = error as { status?: number };
        if (apiError?.status === 404) {
          return [];
        }
        throw error;
      }
    },
    enabled: !!turma && !initialError && activeTab === "historico",
    staleTime: 15 * 1000,
    gcTime: TURMA_QUERY_GC_TIME,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      const apiError = error as { status?: number };
      if (apiError?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });

  const progressoByInscricaoId = useMemo(() => {
    const map = new Map<string, number>();
    const list = inscricoesProgressQuery.data ?? [];
    list.forEach((item) => {
      if (typeof item.progresso === "number") {
        map.set(String(item.id), item.progresso);
      }
    });
    return map;
  }, [inscricoesProgressQuery.data]);

  const inscricoesComProgresso = useMemo(() => {
    const base = inscricoesQuery.data?.items ?? [];
    if (progressoByInscricaoId.size === 0) return base;
    return base.map((item) => {
      const progresso = progressoByInscricaoId.get(String(item.id));
      if (typeof progresso !== "number") return item;
      return { ...item, progresso };
    });
  }, [inscricoesQuery.data?.items, progressoByInscricaoId]);

  const inscricoesPagination = inscricoesQuery.data?.pagination;

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
      inscricoes={inscricoesComProgresso ?? (inscricoesQuery.status === "error" ? [] : [])}
      isLoading={inscricoesQuery.isLoading || inscricoesQuery.isFetching}
      currentPage={inscricoesPagination?.page ?? inscricoesPage}
      pagination={inscricoesPagination}
      onPageChange={setInscricoesPage}
      onSearch={(value) => {
        setInscricoesPage(1);
        setInscricoesSearch(value);
      }}
      onLoadProgress={() => {
        void inscricoesProgressQuery.refetch();
      }}
      isLoadingProgress={inscricoesProgressQuery.isFetching}
      hasLoadedProgress={inscricoesProgressQuery.status === "success"}
    />
  );

  const historyTabContent = (
    <HistoryTab
      turma={turma}
      inscricoes={historyInscricoesQuery.data ?? []}
      isLoading={
        isReloading ||
        historyInscricoesQuery.isLoading ||
        historyInscricoesQuery.isFetching
      }
      turmaId={turmaId}
    />
  );

  const inscricoesCount = inscricoesPagination?.total ?? 0;
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
          router.push(
            `/dashboard/cursos/turmas/${turmaId}/editar?cursoId=${encodeURIComponent(
              String(cursoId)
            )}`
          );
        }}
      />

      <HorizontalTabs
        items={tabs}
        value={activeTab}
        onValueChange={setActiveTab}
        defaultValue="sobre"
      />
    </div>
  );
}

export default TurmaDetailsView;
