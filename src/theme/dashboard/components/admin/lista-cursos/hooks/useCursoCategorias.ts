"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { listCategorias, listSubcategorias } from "@/api/cursos";
import type {
  CategoriaCurso,
  SubcategoriaCurso,
} from "@/api/cursos/categorias/types";
import { queryKeys } from "@/lib/react-query/queryKeys";

type NormalizedCategoria = CategoriaCurso & {
  subcategorias?: SubcategoriaCurso[];
};

function extractCategorias(response: unknown): NormalizedCategoria[] {
  if (!response) return [];

  if (
    typeof response === "object" &&
    response !== null &&
    "data" in response &&
    Array.isArray((response as any).data)
  ) {
    return (response as any).data as NormalizedCategoria[];
  }

  if (Array.isArray(response)) {
    return response as NormalizedCategoria[];
  }

  return [];
}

function extractSubcategorias(response: unknown): SubcategoriaCurso[] {
  if (!response) return [];
  if (
    typeof response === "object" &&
    response !== null &&
    "data" in response &&
    Array.isArray((response as any).data)
  ) {
    return (response as any).data as SubcategoriaCurso[];
  }
  if (Array.isArray(response)) {
    return response as SubcategoriaCurso[];
  }
  return [];
}

const categoriasQueryOptions = {
  queryKey: queryKeys.cursos.categories(),
  queryFn: async () => {
    const response = await listCategorias({ pageSize: 100, page: 1 });
    return extractCategorias(response);
  },
  staleTime: 10 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
  retry: 1,
  refetchOnWindowFocus: false,
} as const;

function useCursoCategoriasData() {
  return useQuery({
    ...categoriasQueryOptions,
  });
}

export function useCursoCategorias() {
  const query = useCursoCategoriasData();
  const categorias = useMemo(() => query.data ?? [], [query.data]);

  const categoriaOptions = useMemo(
    () =>
      categorias.map((categoria) => ({
        value: String(categoria.id),
        label: categoria.nome ?? `Categoria ${categoria.id}`,
      })),
    [categorias],
  );

  const categoriaNameById = useMemo(() => {
    const map: Record<number, string> = {};
    categorias.forEach((categoria) => {
      if (categoria?.id != null) {
        map[Number(categoria.id)] =
          categoria.nome ?? `Categoria ${categoria.id}`;
      }
    });
    return map;
  }, [categorias]);

  return {
    categoriaOptions,
    categoriaNameById,
    rawCategorias: categorias,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error ? query.error.message : null,
    refetch: query.refetch,
  };
}

export function useCursoSubcategorias(categoriaId: number | null) {
  const categoriasQuery = useCursoCategoriasData();
  const categorias = useMemo(
    () => categoriasQuery.data ?? [],
    [categoriasQuery.data],
  );

  // Sempre chama useQuery, mesmo quando não há categoriaId
  // Isso garante que o hook seja sempre chamado na mesma ordem
  const categoriaSelecionada = useMemo(
    () =>
      categoriaId
        ? categorias.find(
            (categoria) => Number(categoria.id) === Number(categoriaId),
          )
        : null,
    [categorias, categoriaId],
  );

  const inlineSubcategorias = useMemo(
    () => categoriaSelecionada?.subcategorias ?? [],
    [categoriaSelecionada],
  );

  const needsFallback = useMemo(
    () =>
      !!categoriaId &&
      inlineSubcategorias.length === 0 &&
      categoriasQuery.isSuccess,
    [categoriaId, inlineSubcategorias.length, categoriasQuery.isSuccess],
  );

  // Sempre chama useQuery, mas desabilita quando não há categoriaId
  const fallbackQuery = useQuery({
    queryKey: queryKeys.cursos.subcategories(categoriaId ?? 0),
    queryFn: async () => {
      if (!categoriaId) return [];
      const response = await listSubcategorias(categoriaId, {
        page: 1,
        pageSize: 100,
      });
      return extractSubcategorias(response);
    },
    enabled: needsFallback,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const subcategorias: SubcategoriaCurso[] = useMemo(() => {
    if (!categoriaId) return [];
    return inlineSubcategorias.length > 0
      ? inlineSubcategorias
      : (fallbackQuery.data ?? []);
  }, [categoriaId, inlineSubcategorias, fallbackQuery.data]);

  const subcategoriaOptions = useMemo(
    () =>
      subcategorias.map((subcategoria) => ({
        value: String(subcategoria.id),
        label:
          subcategoria.nome ?? `Subcategoria ${String(subcategoria.id ?? "")}`,
      })),
    [subcategorias],
  );

  const error =
    categoriasQuery.error?.message || fallbackQuery.error?.message || null;

  return {
    subcategoriaOptions,
    isLoading: categoriasQuery.isLoading || fallbackQuery.isLoading,
    isFetching: categoriasQuery.isFetching || fallbackQuery.isFetching,
    error,
  };
}

export function useAllSubcategorias() {
  const categoriasQuery = useCursoCategoriasData();
  const categorias = useMemo(
    () => categoriasQuery.data ?? [],
    [categoriasQuery.data],
  );

  const inlineSubcategorias = useMemo(() => {
    const subs: SubcategoriaCurso[] = [];
    categorias.forEach((categoria) => {
      if (Array.isArray(categoria?.subcategorias)) {
        subs.push(...categoria.subcategorias);
      }
    });
    return subs;
  }, [categorias]);

  // Sempre chama useQuery, mas controla via enabled
  // Isso garante que o hook seja sempre chamado na mesma ordem
  const needsFallback = useMemo(
    () =>
      categoriasQuery.isSuccess &&
      inlineSubcategorias.length === 0 &&
      categorias.length > 0,
    [categoriasQuery.isSuccess, inlineSubcategorias.length, categorias.length],
  );

  const fallbackQuery = useQuery({
    queryKey: queryKeys.cursos.allSubcategories(),
    queryFn: async () => {
      const results = await Promise.all(
        categorias.map(async (categoria) => {
          try {
            const response = await listSubcategorias(categoria.id, {
              page: 1,
              pageSize: 100,
            });
            return extractSubcategorias(response);
          } catch (error) {
            const status = (error as any)?.status;
            const message = (error as any)?.message;
            if (status === 404 || message?.includes?.("não encontrado")) {
              return [];
            }
            console.warn(
              `Erro ao carregar subcategorias da categoria ${categoria.id}:`,
              error,
            );
            return [];
          }
        }),
      );

      return results.flat();
    },
    enabled: needsFallback,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const subcategoriasCompletas = useMemo(() => {
    return inlineSubcategorias.length > 0
      ? inlineSubcategorias
      : (fallbackQuery.data ?? []);
  }, [inlineSubcategorias, fallbackQuery.data]);

  const subcategoriaNameById = useMemo(() => {
    const map: Record<number, string> = {};
    subcategoriasCompletas.forEach((subcategoria) => {
      if (subcategoria?.id != null) {
        map[Number(subcategoria.id)] =
          subcategoria.nome ?? `Subcategoria ${subcategoria.id}`;
      }
    });
    return map;
  }, [subcategoriasCompletas]);

  const error =
    categoriasQuery.error?.message || fallbackQuery.error?.message || null;

  return {
    subcategoriaNameById,
    isLoading: categoriasQuery.isLoading || fallbackQuery.isLoading,
    isFetching: categoriasQuery.isFetching || fallbackQuery.isFetching,
    error,
  };
}
