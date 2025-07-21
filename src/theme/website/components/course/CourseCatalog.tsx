// src/theme/website/components/course-catalog/CourseCatalog.tsx

"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, Filter, BookOpen, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { CourseCard } from "./components/CourseCard";
import { CourseFilters } from "./components/CourseFilters";
import { Pagination } from "./components/Pagination";
import { EmptyState } from "./components/EmptyState";
import { useCourseCatalogData } from "./hooks/useCourseCatalogData";
import { ImageNotFound } from "@/components/ui/custom/image-not-found";
import { ButtonCustom } from "@/components/ui/custom/button";
import { MODALIDADES, SORT_OPTIONS, COURSE_CATALOG_CONFIG } from "./constants";
import type { CourseCatalogProps, FilterState } from "./types";

const CourseCatalog: React.FC<CourseCatalogProps> = ({
  className,
  fetchFromApi = true,
  staticData,
  onDataLoaded,
  onError,
  showHeader = true,
}) => {
  const { courses, categories, isLoading, error, refetch } =
    useCourseCatalogData(fetchFromApi, staticData);

  const [filters, setFilters] = useState<FilterState>({
    busca: "",
    ordenacao: "relevancia",
    categoriasSelecionadas: [],
    modalidadesSelecionadas: [],
  });
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Callbacks quando dados são carregados ou há erro
  useEffect(() => {
    if (courses && courses.length > 0 && !isLoading) {
      onDataLoaded?.({ courses, categories });
    }
  }, [courses, categories, isLoading, onDataLoaded]);

  useEffect(() => {
    if (error) {
      onError?.(error);
    }
  }, [error, onError]);

  // Reset da página quando filtros mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Filtros e busca
  const cursosFiltrados = useMemo(() => {
    return courses.filter((curso) => {
      const matchBusca =
        curso.titulo.toLowerCase().includes(filters.busca.toLowerCase()) ||
        curso.descricao.toLowerCase().includes(filters.busca.toLowerCase());
      const matchCategoria =
        filters.categoriasSelecionadas.length === 0 ||
        filters.categoriasSelecionadas.includes(curso.categoria);
      const matchModalidade =
        filters.modalidadesSelecionadas.length === 0 ||
        filters.modalidadesSelecionadas.includes(curso.modalidade);

      return matchBusca && matchCategoria && matchModalidade;
    });
  }, [courses, filters]);

  // Paginação - CORRIGIDA
  const totalPages = Math.ceil(
    cursosFiltrados.length / COURSE_CATALOG_CONFIG.pagination.itemsPerPage
  );
  const cursosComPaginacao = useMemo(() => {
    const startIndex =
      (currentPage - 1) * COURSE_CATALOG_CONFIG.pagination.itemsPerPage;
    const endIndex = startIndex + COURSE_CATALOG_CONFIG.pagination.itemsPerPage;
    return cursosFiltrados.slice(startIndex, endIndex);
  }, [cursosFiltrados, currentPage]);

  const toggleCategoria = (categoria: string) => {
    setFilters((prev) => ({
      ...prev,
      categoriasSelecionadas: prev.categoriasSelecionadas.includes(categoria)
        ? prev.categoriasSelecionadas.filter((c) => c !== categoria)
        : [...prev.categoriasSelecionadas, categoria],
    }));
  };

  const toggleModalidade = (modalidade: string) => {
    setFilters((prev) => ({
      ...prev,
      modalidadesSelecionadas: prev.modalidadesSelecionadas.includes(modalidade)
        ? prev.modalidadesSelecionadas.filter((m) => m !== modalidade)
        : [...prev.modalidadesSelecionadas, modalidade],
    }));
  };

  const limparFiltros = () => {
    setFilters((prev) => ({
      ...prev,
      categoriasSelecionadas: [],
      modalidadesSelecionadas: [],
    }));
  };

  const limparTudo = () => {
    setFilters({
      busca: "",
      ordenacao: "relevancia",
      categoriasSelecionadas: [],
      modalidadesSelecionadas: [],
    });
  };

  // CORRIGIDO: Separar filtros de busca
  const temFiltrosCategoriasModalidades =
    filters.categoriasSelecionadas.length > 0 ||
    filters.modalidadesSelecionadas.length > 0;

  const temBusca = filters.busca.length > 0;

  const temAlgumFiltro = temFiltrosCategoriasModalidades || temBusca;

  // Estado de carregamento
  if (isLoading) {
    return (
      <div
        className={cn(
          "min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30",
          className
        )}
      >
        {showHeader && (
          <div className="bg-white/95 backdrop-blur-xl border-b border-slate-200/60 h-18">
            <div className=" container mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-full">
              <div className="w-10 h-10 bg-gray-200 rounded-2xl animate-pulse" />
              <div className="ml-4 h-6 bg-gray-200 rounded w-32 animate-pulse" />
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-16 space-y-4">
            <div className="h-12 bg-gray-200 rounded w-96 mx-auto animate-pulse" />
            <div className="h-6 bg-gray-200 rounded w-80 mx-auto animate-pulse" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="bg-white rounded-3xl overflow-hidden">
                <div className="h-48 bg-gray-200 animate-pulse" />
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-gray-200 rounded animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                  </div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Estado de erro
  if (error && (!courses || courses.length === 0)) {
    return (
      <div
        className={cn(
          "min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30",
          className
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <ImageNotFound
              size="2xl"
              variant="error"
              message="Erro ao carregar catálogo"
              icon="AlertCircle"
              className="mx-auto mb-6"
            />
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Não foi possível carregar o catálogo de cursos.
              {error.includes("padrão") ? " Exibindo dados de exemplo." : ""}
            </p>
            {!error.includes("padrão") && (
              <ButtonCustom
                onClick={refetch}
                variant="default"
                icon="RefreshCw"
              >
                Tentar Novamente
              </ButtonCustom>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30",
        className
      )}
    >
      {/* Header */}
      {showHeader && (
        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="bg-white/95 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-50"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-18">
              <motion.div
                className="flex items-center"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div className="ml-4">
                  <span className="text-2xl font-bold text-slate-900">
                    EduPlatform
                  </span>
                </div>
              </motion.div>
              <motion.div
                className="flex items-center space-x-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Button
                  variant="ghost"
                  className="text-slate-600 hover:text-slate-900 font-medium"
                >
                  Entrar
                </Button>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium">
                  Começar
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.header>
      )}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Transforme Sua
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              {" "}
              Carreira
            </span>
          </motion.h1>
          <motion.p
            className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Cursos desenvolvidos para profissionais que buscam excelência e
            resultados excepcionais.
          </motion.p>
        </motion.div>

        {/* Controles */}
        <motion.div
          className="bg-white rounded-3xl border border-slate-200/60 p-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
            <div className="flex-1 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Buscar cursos..."
                  value={filters.busca}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, busca: e.target.value }))
                  }
                  className="pl-12 pr-4 py-4 w-full bg-slate-50 border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-colors"
                />
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant="secondary"
                  className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full font-semibold text-base"
                >
                  {cursosComPaginacao.length} de {cursosFiltrados.length} cursos
                </Badge>
                <Button
                  variant="outline"
                  onClick={() => setFiltrosAbertos(!filtrosAbertos)}
                  className="lg:hidden border-slate-200 rounded-xl px-4 py-2"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                  {temFiltrosCategoriasModalidades && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full ml-2" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* CORRIGIDO: Só mostra se tem busca OU filtros */}
              {temAlgumFiltro && (
                <Button
                  variant="ghost"
                  onClick={limparTudo}
                  className="text-slate-500 hover:text-slate-700 px-3 py-2 rounded-xl"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Limpar
                </Button>
              )}
              <Select
                value={filters.ordenacao}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, ordenacao: value }))
                }
              >
                <SelectTrigger className="w-48 bg-slate-50 border-slate-200 rounded-2xl py-4">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filtros Ativos */}
          {temAlgumFiltro && (
            <motion.div
              className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-200"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              {filters.busca && (
                <Badge
                  variant="secondary"
                  className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full"
                >
                  Busca: "{filters.busca}"
                  <button
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, busca: "" }))
                    }
                    className="ml-2 hover:text-slate-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {filters.categoriasSelecionadas.map((categoria) => (
                <Badge
                  key={categoria}
                  variant="secondary"
                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full"
                >
                  {categoria}
                  <button
                    onClick={() => toggleCategoria(categoria)}
                    className="ml-2 hover:text-blue-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {filters.modalidadesSelecionadas.map((modalidade) => (
                <Badge
                  key={modalidade}
                  variant="secondary"
                  className="bg-green-100 text-green-700 px-3 py-1 rounded-full"
                >
                  {modalidade}
                  <button
                    onClick={() => toggleModalidade(modalidade)}
                    className="ml-2 hover:text-green-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </motion.div>
          )}
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar de Filtros */}
          <AnimatePresence>
            {(filtrosAbertos ||
              (typeof window !== "undefined" && window.innerWidth >= 1024)) && (
              <motion.div
                className="lg:w-80"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <CourseFilters
                  categories={categories}
                  modalidades={MODALIDADES}
                  categoriasSelecionadas={filters.categoriasSelecionadas}
                  modalidadesSelecionadas={filters.modalidadesSelecionadas}
                  onToggleCategoria={toggleCategoria}
                  onToggleModalidade={toggleModalidade}
                  onLimparFiltros={limparFiltros}
                  temFiltrosAtivos={temFiltrosCategoriasModalidades}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Grid de Cursos */}
          <div className="flex-1">
            {cursosFiltrados.length === 0 ? (
              <EmptyState
                hasFilters={temAlgumFiltro}
                onClearFilters={limparTudo}
                searchTerm={filters.busca}
              />
            ) : (
              <>
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  {cursosComPaginacao.map((curso, index) => (
                    <CourseCard key={curso.id} course={curso} index={index} />
                  ))}
                </motion.div>

                {/* Paginação */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={COURSE_CATALOG_CONFIG.pagination.itemsPerPage}
                  totalItems={cursosFiltrados.length}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Indicador de erro sutil */}
      {error && courses.length > 0 && (
        <div className="text-center py-4">
          <span className="text-xs text-gray-500">Dados de exemplo</span>
        </div>
      )}
    </div>
  );
};

export default CourseCatalog;
