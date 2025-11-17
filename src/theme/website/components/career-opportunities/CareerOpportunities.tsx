"use client";

import React, { useState, useEffect, useMemo } from "react";
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

  // Hook condicional baseado em fetchFromApi
  const apiResult = fetchFromApi
    ? usePublicVagas(filters, itemsPerPage, true)
    : null;

  const mockResult = !fetchFromApi
    ? useCareerData(false, staticData, filters)
    : null;

  // Unificar resultados
  const data = apiResult?.data || mockResult?.data || [];
  const filteredData =
    apiResult?.filteredData || mockResult?.filteredData || [];
  const isLoading = apiResult?.isLoading || mockResult?.isLoading || false;
  const error = apiResult?.error || mockResult?.error || null;
  const totalCount = apiResult?.totalCount || mockResult?.totalCount || 0;
  const refetch = apiResult?.refetch || mockResult?.refetch || (() => {});
  const currentPage = apiResult?.currentPage || 1;
  const totalPages = apiResult?.totalPages || 1;
  const setPage = apiResult?.setPage || (() => {});

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

  // Handlers para ações dos cards
  const handleApply = (jobId: string) => {
    console.log("Aplicar para vaga:", jobId);
    // Implementar lógica de candidatura
  };

  const handleViewDetails = (job: JobData) => {
    if (typeof window === "undefined") return;
    const detailsUrl = `/vagas/${job.slug || job.id}`;
    window.open(detailsUrl, "_blank", "noopener,noreferrer");
  };

  // Estado de carregamento agora é tratado localmente na lista/filters (sem tela inteira)

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
      />

      <section className="bg-[#f4f6f8] pb-16 pt-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-4 space-y-8">
          <VagasListHeader
            totalCount={totalCount}
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
              isDisabled={isLoading}
            />

            <div className="space-y-6 flex-1">
              <div className="space-y-4">
                {isLoading
                  ? Array.from({ length: 3 }).map((_, index) => (
                        <div
                        key={`card-skeleton-${index}`}
                        className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 animate-pulse"
                        >
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-2xl bg-gray-100" />
                          <div className="space-y-2">
                            <div className="h-4 w-28 bg-gray-100 rounded" />
                            <div className="h-6 w-48 bg-gray-100 rounded" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 w-full bg-gray-100 rounded" />
                          <div className="h-4 w-5/6 bg-gray-100 rounded" />
                          <div className="h-4 w-2/3 bg-gray-100 rounded" />
                    </div>
                        <div className="h-10 bg-gray-50 rounded-lg" />
                  </div>
                    ))
                  : filteredData.map((job, index) => (
                <JobCard
                  key={job.id}
                  job={job}
                  index={index}
                  onApply={handleApply}
                  onViewDetails={handleViewDetails}
                />
              ))}
              </div>

              {filteredData.length === 0 && (
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

              {filteredData.length > 0 && (
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
