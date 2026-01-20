"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { JobCard } from "./components/JobCard";
import { HeaderVagas } from "./components/HeaderVagas";
import { VagasListHeader } from "./components/VagasListHeader";
import { FilterSidebar, FilterListKey } from "./components/FilterSidebar";
import { useCareerData } from "./hooks/useCareerData";
import { usePublicVagas } from "./hooks/usePublicVagas";
import { ImageNotFound } from "@/components/ui/custom/image-not-found";
import { EmptyState } from "@/components/ui/custom/empty-state/EmptyState";
import { ButtonCustom } from "@/components/ui/custom/button";
import { Card, CardContent } from "@/components/ui/card";
import { RotateCcw } from "lucide-react";
import type { CareerOpportunitiesProps, JobFilters, JobData } from "./types";
import { CAREER_CONFIG } from "./constants";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toastCustom } from "@/components/ui/custom/toast";
import { UserRole } from "@/config/roles";
import { useUserRole } from "@/hooks/useUserRole";
import { aplicarVaga, listCurriculos, verificarCandidatura } from "@/api/candidatos";
import type { VerificarCandidaturaResponse } from "@/api/candidatos/types";

function isUuid(value: string): boolean {
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
    value,
  );
}

function getDefaultCurriculoId(raw: unknown): string | null {
  if (!Array.isArray(raw)) return null;
  const items = raw.filter((item) => item && typeof item === "object") as Array<
    Record<string, any>
  >;
  const principal = items.find(
    (c) => c.principal === true && typeof c.id === "string",
  );
  if (principal?.id) return principal.id;
  const first = items.find((c) => typeof c.id === "string");
  return first?.id ?? null;
}

function getHasTokenCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((row) => row.startsWith("token="));
}

function composeLoginUrl(): string {
  if (typeof window === "undefined") return "/auth/login";
  const redirectPath = `${window.location.pathname}${window.location.search}`;
  return `/auth/login?redirect=${encodeURIComponent(redirectPath)}`;
}

function ApplyAwareJobCard({
  job,
  index,
  canCheckApplied,
  applyDisabled,
  applyLabel,
  onApply,
  onViewDetails,
}: {
  job: JobData;
  index: number;
  canCheckApplied: boolean;
  applyDisabled?: boolean;
  applyLabel?: string;
  onApply: (job: JobData) => void;
  onViewDetails: (job: JobData) => void;
}) {
  const shouldCheck = canCheckApplied && isUuid(job.id);
  const appliedQuery = useQuery<VerificarCandidaturaResponse>({
    queryKey: ["aluno-candidato", "candidaturas", "verificar", job.id],
    queryFn: () => verificarCandidatura(job.id, { cache: "no-store" }),
    enabled: shouldCheck,
    staleTime: 60 * 1000,
    retry: 1,
  });

  const hasApplied = appliedQuery.data?.hasApplied === true;

  return (
    <JobCard
      job={job}
      index={index}
      onApply={(jobId) => {
        void jobId;
        onApply(job);
      }}
      onViewDetails={onViewDetails}
      isApplied={hasApplied}
      applyDisabled={applyDisabled || appliedQuery.isFetching}
      applyLabel={appliedQuery.isFetching ? "Verificando..." : applyLabel}
    />
  );
}

const CareerOpportunities: React.FC<CareerOpportunitiesProps> = ({
  className,
  fetchFromApi = true,
  staticData,
  onDataLoaded,
  onError,
  itemsPerPage = 10,
}) => {
  // Estados para filtros
  const [filters, setFilters] = useState<JobFilters>({
    busca: "",
    categorias: [],
    modalidades: [],
    tiposContrato: [],
    niveis: [],
    apenasDestaque: false,
    apenasVagasPCD: false,
  });

  const [sortOrder, setSortOrder] = useState("recent");
  const [regionQuery, setRegionQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Sempre chamar os hooks (não condicionalmente)
  const apiResult = usePublicVagas(filters, itemsPerPage, fetchFromApi);
  const mockResult = useCareerData(!fetchFromApi, staticData, filters);

  // Unificar resultados baseado em fetchFromApi
  const data = fetchFromApi ? apiResult.data : mockResult.data;
  const filteredData = fetchFromApi ? apiResult.filteredData : mockResult.filteredData;
  const isLoading = fetchFromApi ? apiResult.isLoading : mockResult.isLoading;
  const error = fetchFromApi ? apiResult.error : mockResult.error;
  const totalCount = fetchFromApi ? apiResult.totalCount : mockResult.totalCount;
  const refetch = fetchFromApi ? apiResult.refetch : mockResult.refetch;
  const currentPage = fetchFromApi ? apiResult.currentPage : 1;
  const totalPages = fetchFromApi ? apiResult.totalPages : 1;
  const setPage = fetchFromApi ? apiResult.setPage : (() => {});
  const role = useUserRole();
  const queryClient = useQueryClient();
  const canCandidateApply = isAuthenticated && role === UserRole.ALUNO_CANDIDATO;
  const [pendingApplyById, setPendingApplyById] = useState<Record<string, boolean>>(
    {},
  );

  useEffect(() => {
    setIsAuthenticated(getHasTokenCookie());
    const interval = setInterval(() => {
      setIsAuthenticated(getHasTokenCookie());
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Controla quando mostrar skeleton durante busca manual
  const showSkeleton = isLoading || isSearching;
  
  // Só mostra dados quando não está carregando e não está buscando
  const shouldShowData = !isLoading && !isSearching && filteredData.length > 0;

  // Contadores de filtros (derivados dos dados carregados)
  const filterCounts = useMemo(() => {
    const categorias = new Map<string, number>();
    const modalidades = new Map<string, number>();
    const tiposContrato = new Map<string, number>();
    const niveis = new Map<string, number>();

    // Listas completas para manter opções visíveis mesmo quando a API filtra
    const ALL_MODALIDADES = ["REMOTO", "PRESENCIAL", "HIBRIDO"];
    const ALL_TIPOS_CONTRATO = ["CLT", "PJ", "ESTAGIO", "TEMPORARIO"];
    const ALL_NIVEIS = [
      "ESTAGIARIO",
      "JUNIOR",
      "PLENO",
      "SENIOR",
      "ESPECIALISTA",
      "LIDER",
    ];

    data.forEach((job) => {
      categorias.set(job.categoria, (categorias.get(job.categoria) || 0) + 1);
      modalidades.set(
        job.modalidade,
        (modalidades.get(job.modalidade) || 0) + 1
      );
      tiposContrato.set(
        job.tipoContrato,
        (tiposContrato.get(job.tipoContrato) || 0) + 1
      );
      niveis.set(job.nivel, (niveis.get(job.nivel) || 0) + 1);
    });

    return {
      categorias: Array.from(categorias.entries()).map(([nome, count]) => ({
        nome,
        count,
      })),
      modalidades: ALL_MODALIDADES.map((nome) => ({
        nome,
        count: modalidades.get(nome) || 0,
      })),
      tiposContrato: ALL_TIPOS_CONTRATO.map((nome) => ({
        nome,
        count: tiposContrato.get(nome) || 0,
      })),
      niveis: ALL_NIVEIS.map((nome) => ({
        nome,
        count: niveis.get(nome) || 0,
      })),
    };
  }, [data]);

  // Callbacks
  useEffect(() => {
    if (data && data.length > 0 && !isLoading) {
      onDataLoaded?.(data);
    }
  }, [data, isLoading, onDataLoaded]);

  useEffect(() => {
    if (error) {
      onError?.(error);
    }
  }, [error, onError]);

  // Handlers para filtros
  const updateFilters = (newFilters: Partial<JobFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    // Sempre volta para a primeira página ao alterar filtros
    if (typeof setPage === "function") setPage(1);
  };

  const toggleArrayFilter = (
    filterType: keyof Pick<
      JobFilters,
      "categorias" | "modalidades" | "tiposContrato" | "niveis"
    >,
    value: string
  ) => {
    const currentArray = filters[filterType];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value];

    updateFilters({ [filterType]: newArray });
  };

  const clearAllFilters = () => {
    setFilters({
      busca: "",
      categorias: [],
      modalidades: [],
      tiposContrato: [],
      niveis: [],
      apenasDestaque: false,
      apenasVagasPCD: false,
    });
  };

  const hasActiveFilters =
    filters.busca.length > 0 ||
    filters.categorias.length > 0 ||
    filters.modalidades.length > 0 ||
    filters.tiposContrato.length > 0 ||
    filters.niveis.length > 0 ||
    filters.apenasDestaque ||
    filters.apenasVagasPCD;

  const activeFilterCount =
    filters.categorias.length +
    filters.modalidades.length +
    filters.tiposContrato.length +
    filters.niveis.length +
    (filters.apenasDestaque ? 1 : 0) +
    (filters.apenasVagasPCD ? 1 : 0);

  const toggleBooleanFilter = (key: "apenasDestaque" | "apenasVagasPCD") => {
    updateFilters({ [key]: !filters[key] } as Pick<JobFilters, typeof key>);
  };

  const curriculosQuery = useQuery({
    queryKey: ["aluno-candidato", "curriculos", "for-apply", "website"],
    queryFn: () => listCurriculos({ cache: "no-store" }),
    enabled: canCandidateApply,
    staleTime: 60 * 1000,
    retry: 1,
  });

  const defaultCurriculoId = useMemo(() => {
    return getDefaultCurriculoId(curriculosQuery.data);
  }, [curriculosQuery.data]);
  const setPendingApply = useCallback((vagaId: string, pending: boolean) => {
    setPendingApplyById((prev) => {
      if (pending) return { ...prev, [vagaId]: true };
      if (!prev[vagaId]) return prev;
      const next = { ...prev };
      delete next[vagaId];
      return next;
    });
  }, []);

  // Handlers para ações dos cards
  const handleApply = (jobId: string, jobTitle?: string | null) => {
    if (!getHasTokenCookie()) {
      toastCustom.info({
        title: "Faça login para se candidatar",
        description: "Entre na sua conta para enviar sua candidatura.",
        linkText: "Entrar",
        linkHref: composeLoginUrl(),
      });
      if (typeof window !== "undefined") {
        window.location.href = composeLoginUrl();
      }
      return;
    }

    if (role === null) {
      toastCustom.info({
        title: "Carregando sua conta",
        description: "Aguarde um instante e tente novamente.",
      });
      return;
    }

    if (role && role !== UserRole.ALUNO_CANDIDATO) {
      toastCustom.error({
        title: "Acesso restrito",
        description: "Apenas alunos e candidatos podem se candidatar a vagas.",
      });
      return;
    }

    if (!isUuid(jobId)) {
      toastCustom.error({
        title: "Vaga inválida",
        description: "Não foi possível identificar esta vaga para candidatura.",
      });
      return;
    }

    if (pendingApplyById[jobId]) {
      return;
    }

    if (curriculosQuery.isLoading) {
      toastCustom.info({
        title: "Carregando currículos",
        description: "Aguarde um instante e tente novamente.",
      });
      return;
    }

    if (!defaultCurriculoId) {
      toastCustom.error({
        title: "Nenhum currículo encontrado",
        description: "Crie um currículo para conseguir se candidatar às vagas.",
        linkText: "Criar currículo",
        linkHref: "/dashboard/curriculo/cadastrar",
      });
      return;
    }

    setPendingApply(jobId, true);

    aplicarVaga({ vagaId: jobId, curriculoId: defaultCurriculoId })
      .then(() => {
        queryClient.setQueryData(
          ["aluno-candidato", "candidaturas", "verificar", jobId],
          { hasApplied: true },
        );
        queryClient.invalidateQueries({
          queryKey: ["aluno-candidato", "candidaturas", "verificar", jobId],
        });

        toastCustom.success({
          title: "Candidatura enviada",
          description: jobTitle
            ? `Sua candidatura para "${jobTitle}" foi registrada com sucesso.`
            : "Sua candidatura foi registrada com sucesso.",
        });
      })
      .catch((error: any) => {
        const code = error?.details?.code || error?.code;
        const message = error?.details?.message || error?.message;

        if (code === "APPLY_ERROR" && typeof message === "string") {
          toastCustom.error({
            title: "Não foi possível se candidatar",
            description: message,
          });
          return;
        }

        toastCustom.error({
          title: "Erro ao se candidatar",
          description:
            typeof message === "string" && message.length > 0
              ? message
              : "Tente novamente em instantes.",
        });
      })
      .finally(() => {
        setPendingApply(jobId, false);
      });
  };

  const handleViewDetails = (job: JobData) => {
    if (typeof window === "undefined") return;
    const detailsUrl = `/vagas/${job.slug || job.id}`;
    window.open(detailsUrl, "_blank", "noopener,noreferrer");
  };

  // Estado de carregamento agora é tratado localmente na lista/filters (sem tela inteira)

  const handleSearch = () => {
    setIsSearching(true);
    if (fetchFromApi && apiResult.refetch) {
      apiResult.refetch();
    }
  };

  // Desativa isSearching quando a busca terminar
  useEffect(() => {
    if (!isLoading && isSearching) {
      setIsSearching(false);
    }
  }, [isLoading, isSearching]);

  // Estado de erro
  if (error && (!data || data.length === 0)) {
    return (
      <div className={cn("min-h-screen bg-[#f4f6f8] py-16", className)}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-2 border-red-100 bg-white rounded-2xl">
            <CardContent className="py-16 text-center space-y-4">
          <ImageNotFound
            size="lg"
            variant="error"
            message="Erro ao carregar vagas"
            icon="AlertCircle"
                className="mx-auto mb-4"
          />
              <h2 className="!mb-0">Não foi possível carregar as vagas</h2>
              <p className="text-gray-600 max-w-md mx-auto">
            Não foi possível carregar as vagas disponíveis.
            {error.includes("padrão") ? " Exibindo dados de exemplo." : ""}
          </p>
          {!error.includes("padrão") && (
                <ButtonCustom
                  onClick={refetch}
                  variant="default"
                  icon="RefreshCw"
                  className="bg-[#1f8454] hover:bg-[#17623d]"
                >
                  Tentar novamente
            </ButtonCustom>
          )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-[#0a1f88]/5", className)}>
      <HeaderVagas
        busca={filters.busca}
        onBuscaChange={(value) => updateFilters({ busca: value })}
        regiao={regionQuery}
        onRegiaoChange={setRegionQuery}
        hasActiveFilters={hasActiveFilters}
        onSearch={handleSearch}
        isLoading={isLoading}
      />

      <section className="bg-[#f4f6f8] pb-16 pt-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-4 space-y-8">
          <VagasListHeader
            totalCount={showSkeleton ? 0 : totalCount}
            sortOrder={sortOrder}
            onSortChange={setSortOrder}
            sortOptions={CAREER_CONFIG.sorting.options}
          />

          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            <FilterSidebar
              filters={filters}
              filterCounts={filterCounts}
              onToggleFilter={
                toggleArrayFilter as (
                  filterType: FilterListKey,
                  value: string
                ) => void
              }
              hasActiveFilters={hasActiveFilters}
              activeFilterCount={activeFilterCount}
              onClearFilters={clearAllFilters}
              isDisabled={showSkeleton}
            />

            <div className="space-y-6 flex-1">
              <div className="space-y-4">
                {showSkeleton
                  ? Array.from({ length: 3 }).map((_, index) => (
                        <div
                        key={`card-skeleton-${index}`}
                        className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-sm animate-pulse"
                        >
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-2xl bg-gray-200" />
                          <div className="space-y-2 flex-1">
                            <div className="h-4 w-28 bg-gray-200 rounded" />
                            <div className="h-6 w-48 bg-gray-200 rounded" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 w-full bg-gray-200 rounded" />
                          <div className="h-4 w-5/6 bg-gray-200 rounded" />
                          <div className="h-4 w-2/3 bg-gray-200 rounded" />
                    </div>
                        <div className="flex items-center gap-4 pt-2">
                          <div className="h-4 w-20 bg-gray-200 rounded" />
                          <div className="h-4 w-24 bg-gray-200 rounded" />
                          <div className="h-4 w-16 bg-gray-200 rounded" />
                  </div>
                        <div className="flex gap-2 pt-2">
                          <div className="h-10 flex-1 bg-gray-100 rounded-full" />
                          <div className="h-10 flex-1 bg-gray-100 rounded-full" />
                    </div>
                  </div>
                    ))
                  : shouldShowData
                  ? filteredData.map((job, index) => (
                <ApplyAwareJobCard
                  key={job.id}
                  job={job}
                  index={index}
                  canCheckApplied={canCandidateApply}
                  applyDisabled={
                    Boolean(pendingApplyById[job.id]) ||
                    (isAuthenticated && role === null)
                  }
                  applyLabel={
                    isAuthenticated && role === null
                      ? "Carregando..."
                      : pendingApplyById[job.id]
                        ? "Enviando..."
                        : "Candidatar-se"
                  }
                  onApply={(selectedJob) =>
                    handleApply(selectedJob.id, selectedJob.titulo ?? null)
                  }
                  onViewDetails={handleViewDetails}
                />
              ))
                  : null}
              </div>

              {!showSkeleton && filteredData.length === 0 && (
                <div className="bg-white border border-gray-200 rounded-2xl">
                  <div className="py-14 px-6">
                    <EmptyState
                      size="md"
                      align="center"
                      illustration="fileNotFound"
                      title="Nenhuma vaga encontrada"
                      description="Ajuste os filtros ou limpe todos para visualizar mais oportunidades disponíveis."
                      actions={
                        <ButtonCustom
                    variant="outline"
                    onClick={clearAllFilters}
                          icon="RotateCcw"
                  >
                    Limpar filtros
                        </ButtonCustom>
                      }
                    />
                  </div>
                </div>
              )}

              {shouldShowData && filteredData.length > 0 && (
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="text-sm text-gray-500">
                    Mostrando {filteredData.length} de {totalCount} vagas
                  </div>
                  {totalPages > 1 && (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Anterior
                      </button>
                      <span className="text-sm text-gray-600">
                        Página {currentPage} de {totalPages}
                      </span>
                      <button
                        onClick={() =>
                          setPage(Math.min(totalPages, currentPage + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Próxima
                      </button>
                </div>
              )}
            </div>
              )}
          </div>
        </div>
      </div>

      {error && data.length > 0 && (
          <div className="text-center text-sm text-yellow-700 bg-yellow-50 border-t border-yellow-100 py-3 mt-8">
            Alguns dados podem estar indisponíveis no momento. Exibindo conteúdo
            em cache.
        </div>
      )}
      </section>
    </div>
  );
};

export default CareerOpportunities;
