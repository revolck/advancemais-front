"use client";

import React, { useState, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import { CourseCard } from "./components/CourseCard";
import { CourseHeader } from "./components/CourseHeader";
import { CourseListHeader } from "./components/CourseListHeader";
import { FilterSidebar } from "./components/FilterSidebar";
import { usePublicCursos } from "./hooks/usePublicCursos";
import { EmptyState } from "@/components/ui/custom/empty-state/EmptyState";
import { ButtonCustom } from "@/components/ui/custom/button";
import type { CourseCatalogProps, CourseFilters, CourseData } from "./types";
import { COURSE_CONFIG } from "./constants";

export function CourseCatalog({
  className,
  fetchFromApi = true,
  staticData,
  itemsPerPage = 12,
}: CourseCatalogProps) {
  // Estados para filtros
  const [filters, setFilters] = useState<CourseFilters>({
    busca: "",
    categorias: [],
    modalidades: [],
    apenasComVagas: false,
  });

  const [sortOrder, setSortOrder] = useState("recent");
  const [isSearching, setIsSearching] = useState(false);

  // Sempre chamar o hook (não condicionalmente)
  const apiResult = usePublicCursos(filters, itemsPerPage, fetchFromApi);

  const data = apiResult.data;
  const filteredData = apiResult.filteredData;
  const isLoading = apiResult.isLoading;
  const error = apiResult.error;
  const totalCount = apiResult.totalCount;
  const currentPage = apiResult.currentPage;
  const totalPages = apiResult.totalPages;
  const setPage = apiResult.setPage;

  // Controla quando mostrar skeleton durante busca manual
  const showSkeleton = isLoading || isSearching;

  // Só mostra dados quando não está carregando e não está buscando
  const shouldShowData = !isLoading && !isSearching && filteredData.length > 0;

  // Contadores de filtros
  const filterCounts = useMemo(() => {
    const categorias = new Map<string, number>();

    data.forEach((course) => {
      categorias.set(
        course.categoria,
        (categorias.get(course.categoria) || 0) + 1,
      );
    });

    return {
      categorias: Array.from(categorias.entries()).map(([nome, count]) => ({
        nome,
        count,
      })),
    };
  }, [data]);

  const updateFilters = (newFilters: Partial<CourseFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    if (typeof setPage === "function") setPage(1);
  };

  const toggleArrayFilter = (
    filterType: keyof Pick<CourseFilters, "categorias">,
    value: string,
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
      apenasComVagas: false,
    });
  };

  const hasActiveFilters =
    filters.busca.length > 0 ||
    filters.categorias.length > 0 ||
    filters.apenasComVagas;

  const activeFilterCount =
    filters.categorias.length + (filters.apenasComVagas ? 1 : 0);

  const handleViewDetails = (course: CourseData) => {
    if (typeof window === "undefined") return;
    const detailsUrl = `/cursos/${course.id}`;
    window.open(detailsUrl, "_blank", "noopener,noreferrer");
  };

  const handleSearch = () => {
    setIsSearching(true);
    if (apiResult?.refetch) {
      apiResult.refetch();
    }
  };

  // Desativa isSearching quando a busca terminar
  useEffect(() => {
    if (!isLoading && isSearching) {
      setIsSearching(false);
    }
  }, [isLoading, isSearching]);

  return (
    <div className={cn("bg-[#0a1f88]/5", className)}>
      <CourseHeader
        busca={filters.busca}
        onBuscaChange={(value) => updateFilters({ busca: value })}
        hasActiveFilters={hasActiveFilters}
        onSearch={handleSearch}
        isLoading={isLoading}
      />

      <section className="bg-[#f4f6f8] pb-16 pt-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <CourseListHeader
            totalCount={showSkeleton ? 0 : totalCount}
            sortOrder={sortOrder}
            onSortChange={setSortOrder}
            sortOptions={COURSE_CONFIG.sorting.options}
          />

          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            <FilterSidebar
              filters={filters}
              filterCounts={filterCounts}
              onToggleFilter={toggleArrayFilter}
              hasActiveFilters={hasActiveFilters}
              activeFilterCount={activeFilterCount}
              onClearFilters={clearAllFilters}
              isDisabled={showSkeleton}
            />

            <div className="space-y-6 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {showSkeleton
                  ? Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={`skeleton-${index}`}
                        className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm animate-pulse"
                      >
                        <div className="h-56 bg-gradient-to-br from-gray-200 to-gray-300" />
                        <div className="p-6 space-y-5">
                          <div className="space-y-3">
                            <div className="h-7 w-3/4 bg-gray-200 rounded" />
                            <div className="h-4 w-full bg-gray-200 rounded" />
                            <div className="h-4 w-5/6 bg-gray-200 rounded" />
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gray-200 rounded-lg" />
                              <div className="h-4 w-20 bg-gray-200 rounded" />
                            </div>
                          </div>
                          <div className="flex gap-3 pt-2">
                            <div className="h-10 flex-1 bg-gray-100 rounded-xl" />
                            <div className="h-10 flex-1 bg-gray-100 rounded-xl" />
                          </div>
                        </div>
                      </div>
                    ))
                  : shouldShowData
                    ? filteredData.map((course, index) => (
                        <CourseCard
                          key={course.id}
                          course={course}
                          index={index}
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
                      title="Nenhum curso encontrado"
                      description="Não encontramos cursos com os filtros aplicados. Tente ajustar sua busca."
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
                    Mostrando {filteredData.length} de {totalCount} cursos
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
      </section>
    </div>
  );
}

export default CourseCatalog;
