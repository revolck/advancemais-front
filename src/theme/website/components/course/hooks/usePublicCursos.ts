"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { listCursos } from "@/api/cursos";
import { listCategorias } from "@/api/cursos/categorias";
import { formatReadableText } from "@/lib/display-text";
import type { CourseData, CourseFilters } from "../types";

function mapCursoToData(curso: any): CourseData {
  const subcategoria = curso.subcategoria?.nome || curso.Subcategoria?.nome;

  return {
    id: curso.id?.toString() || "",
    nome: formatReadableText(curso.nome || "Curso"),
    descricao: curso.descricao || "",
    cargaHoraria: curso.cargaHoraria || 0,
    categoria: formatReadableText(
      curso.categoria?.nome || curso.Categoria?.nome || "Geral",
    ),
    subcategoria: subcategoria ? formatReadableText(subcategoria) : undefined,
    imagemUrl: curso.imagemUrl,
    statusPadrao: curso.statusPadrao || "PUBLICADO",
    estagioObrigatorio: Boolean(curso.estagioObrigatorio),
    totalTurmas: curso.totalTurmas || curso._count?.turmas || 0,
    totalAlunos: curso.totalAlunos || 0,
    criadoEm: curso.criadoEm || new Date().toISOString(),
    // Campos de precificação
    valor: Number(curso.valor ?? 0),
    valorPromocional:
      curso.valorPromocional != null
        ? Number(curso.valorPromocional)
        : undefined,
    gratuito: Boolean(curso.gratuito ?? false),
  };
}

interface UsePublicCursosReturn {
  data: CourseData[];
  filteredData: CourseData[];
  availableCategories: string[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  refetch: () => void;
  setPage: (page: number) => void;
}

export function usePublicCursos(
  filters: CourseFilters,
  pageSize: number = 12,
  enabled: boolean = true,
): UsePublicCursosReturn {
  const [data, setData] = useState<CourseData[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  const fetchCategorias = async () => {
    try {
      const response = await listCategorias(
        { page: 1, pageSize: 500, sortBy: "nome", sortOrder: "asc" },
        { cache: "no-store" },
      );

      if (!Array.isArray(response)) return;

      const names = response
        .map((categoria) => formatReadableText(categoria?.nome || ""))
        .filter(Boolean);

      setAvailableCategories(Array.from(new Set(names)));
    } catch (err) {
      console.error("Erro ao buscar categorias de cursos:", err);
    }
  };

  const fetchCursos = useCallback(async () => {
    if (!enabled) {
      setData([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Só envia busca se tiver 3 ou mais caracteres
      const searchQuery = filters.busca?.trim();
      const validSearch =
        searchQuery && searchQuery.length >= 3 ? searchQuery : undefined;

      const response = await listCursos(
        {
          page: currentPage,
          pageSize,
          search: validSearch,
          statusPadrao: "PUBLICADO",
        },
        { cache: "no-store" },
      );

      const mappedData = (response.data || []).map(mapCursoToData);
      setData(mappedData);
      setTotalCount(response.pagination?.total || mappedData.length);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (err) {
      console.error("Erro ao buscar cursos públicos:", err);
      setError("Erro ao carregar cursos.");
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, enabled, filters.busca, pageSize]);

  useEffect(() => {
    fetchCursos();
  }, [fetchCursos]);

  useEffect(() => {
    if (!enabled) return;
    fetchCategorias();
  }, [enabled]);

  // Filtros aplicados no client-side
  const filteredData = useMemo(() => {
    return data.filter((course) => {
      const matchCategoria =
        filters.categorias.length === 0 ||
        filters.categorias.includes(course.categoria);

      const matchVagas =
        !filters.apenasComVagas ||
        (course.totalTurmas && course.totalTurmas > 0);

      return matchCategoria && matchVagas;
    });
  }, [data, filters.categorias, filters.apenasComVagas]);

  return {
    data,
    filteredData,
    availableCategories,
    isLoading,
    error,
    totalCount,
    currentPage,
    totalPages,
    refetch: fetchCursos,
    setPage: setCurrentPage,
  };
}
