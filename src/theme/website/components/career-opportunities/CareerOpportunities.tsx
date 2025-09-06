// src/theme/website/components/career-opportunities/CareerOpportunities.tsx

"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { JobCard } from "./components/JobCard";
import { useCareerData } from "./hooks/useCareerData";
import { ImageNotFound } from "@/components/ui/custom/image-not-found";
import { ButtonCustom } from "@/components/ui/custom/button";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/radix-checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Filter,
  RotateCcw,
  Briefcase,
  Monitor,
  Building2,
  Zap,
  User,
  GraduationCap,
} from "lucide-react";
import type { CareerOpportunitiesProps, JobFilters } from "./types";
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
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const {
    data,
    filteredData,
    filterCounts,
    isLoading,
    error,
    totalCount,
    refetch,
  } = useCareerData(fetchFromApi, staticData, filters);

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

  // Handlers para ações dos cards
  const handleApply = (jobId: number) => {
    console.log("Aplicar para vaga:", jobId);
    // Implementar lógica de candidatura
  };

  const handleViewDetails = (jobId: number) => {
    console.log("Ver detalhes da vaga:", jobId);
    // Implementar navegação para detalhes
  };

  // Estado de carregamento
  if (isLoading) {
    return (
      <div className={cn("min-h-screen bg-gray-50/30 py-12", className)}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Header skeleton */}
          <div className="text-center mb-16">
            <div className="h-12 bg-gray-200 rounded w-96 mx-auto mb-4 animate-pulse" />
            <div className="h-6 bg-gray-200 rounded w-64 mx-auto animate-pulse" />
          </div>

          {/* Search skeleton */}
          <div className="bg-white/70 rounded-2xl p-8 mb-12">
            <div className="h-12 bg-gray-200 rounded animate-pulse" />
          </div>

          {/* Content skeleton */}
          <div className="flex gap-12">
            <div className="w-72">
              <div className="h-96 bg-gray-200 rounded-2xl animate-pulse" />
            </div>
            <div className="flex-1 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-48 bg-gray-200 rounded-xl animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Estado de erro
  if (error && (!data || data.length === 0)) {
    return (
      <div className={cn("min-h-screen bg-gray-50/30 py-16", className)}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <ImageNotFound
            size="lg"
            variant="error"
            message="Erro ao carregar vagas"
            icon="AlertCircle"
            className="mx-auto mb-6"
          />
          <p className="text-gray-600 mb-4 max-w-md mx-auto">
            Não foi possível carregar as vagas disponíveis.
            {error.includes("padrão") ? " Exibindo dados de exemplo." : ""}
          </p>
          {!error.includes("padrão") && (
            <ButtonCustom onClick={refetch} variant="default" icon="RefreshCw">
              Tentar Novamente
            </ButtonCustom>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen bg-gray-50/30", className)}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            Encontre sua próxima
            <br />
            oportunidade
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
            Conectamos talentos excepcionais com empresas que valorizam inovação
            e crescimento.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-gray-200/60 p-8 mb-12 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
            <div className="flex-1 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Buscar por cargo, empresa ou tecnologia..."
                  value={filters.busca}
                  onChange={(e) => updateFilters({ busca: e.target.value })}
                  className="pl-12 pr-4 py-4 w-full bg-gray-50/50 border-gray-200/60 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 text-base"
                />
              </div>
              <div className="flex items-center gap-4">
                <Badge
                  variant="secondary"
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full font-semibold"
                >
                  {totalCount} vagas
                </Badge>
                <Button
                  variant="outline"
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="lg:hidden border-gray-200 rounded-xl px-4 py-2 font-medium"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                  {hasActiveFilters && (
                    <div className="w-2 h-2 bg-black rounded-full ml-2" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  onClick={clearAllFilters}
                  className="text-gray-500 hover:text-gray-700 px-4 py-2 rounded-xl font-medium"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Limpar
                </Button>
              )}
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-48 bg-gray-50/50 border-gray-200/60 rounded-xl py-4 font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CAREER_CONFIG.sorting.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filters */}
          {(showMobileFilters ||
            (typeof window !== "undefined" && window.innerWidth >= 1024)) && (
            <div className="lg:w-72">
              <Card className="bg-white/70 backdrop-blur-xl border-gray-200/60 rounded-2xl shadow-sm">
                <CardHeader className="pb-6">
                  <CardTitle className="text-lg font-bold text-gray-900 flex items-center justify-between">
                    Filtros
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-xl"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Categorias */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">
                      Área
                    </h3>
                    <div className="space-y-3">
                      {filterCounts.categorias.map((categoria) => (
                        <div
                          key={categoria.nome}
                          className="flex items-center justify-between group"
                        >
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              id={categoria.nome}
                              checked={filters.categorias.includes(
                                categoria.nome
                              )}
                              onCheckedChange={() =>
                                toggleArrayFilter("categorias", categoria.nome)
                              }
                              className="rounded-md border-gray-300 data-[state=checked]:bg-black data-[state=checked]:border-black"
                            />
                            <label
                              htmlFor={categoria.nome}
                              className="text-gray-700 cursor-pointer group-hover:text-gray-900 transition-colors font-medium"
                            >
                              {categoria.nome}
                            </label>
                          </div>
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full font-medium">
                            {categoria.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="bg-gray-200/60" />

                  {/* Modalidades */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">
                      Modalidade
                    </h3>
                    <div className="space-y-3">
                      {filterCounts.modalidades.map((modalidade) => {
                        const IconComponent =
                          modalidade.icon === "Monitor"
                            ? Monitor
                            : modalidade.icon === "Building2"
                            ? Building2
                            : Zap;
                        return (
                          <div
                            key={modalidade.nome}
                            className="flex items-center space-x-3 group"
                          >
                            <Checkbox
                              id={modalidade.nome}
                              checked={filters.modalidades.includes(
                                modalidade.nome
                              )}
                              onCheckedChange={() =>
                                toggleArrayFilter(
                                  "modalidades",
                                  modalidade.nome
                                )
                              }
                              className="rounded-md border-gray-300 data-[state=checked]:bg-black data-[state=checked]:border-black"
                            />
                            <label
                              htmlFor={modalidade.nome}
                              className="text-gray-700 cursor-pointer group-hover:text-gray-900 transition-colors font-medium flex items-center gap-3"
                            >
                              <IconComponent className="w-4 h-4" />
                              {modalidade.nome}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Job Listings */}
          <div className="flex-1">
            <div className="space-y-4">
              {filteredData.map((job, index) => (
                <JobCard
                  key={job.id}
                  job={job}
                  index={index}
                  onApply={handleApply}
                  onViewDetails={handleViewDetails}
                />
              ))}

              {filteredData.length === 0 && (
                <div className="text-center py-16">
                  <ImageNotFound
                    size="lg"
                    variant="muted"
                    message="Nenhuma vaga encontrada"
                    icon="Search"
                    className="mx-auto mb-4"
                  />
                  <p className="text-gray-600 mb-4">
                    Não encontramos vagas que correspondam aos seus filtros.
                  </p>
                  <Button
                    variant="outline"
                    onClick={clearAllFilters}
                    className="mx-auto"
                  >
                    Limpar filtros
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Indicador de erro sutil */}
      {error && data.length > 0 && (
        <div className="text-center py-4">
          <span className="text-xs text-gray-500">Dados de exemplo</span>
        </div>
      )}
    </div>
  );
};

export default CareerOpportunities;
