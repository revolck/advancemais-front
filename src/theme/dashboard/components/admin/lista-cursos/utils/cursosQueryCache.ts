"use client";

import type { QueryClient, QueryKey } from "@tanstack/react-query";
import type { Curso } from "@/api/cursos";

function cursoMatchesFilters(curso: Curso, filters: any): boolean {
  if (!filters || typeof filters !== "object") return true;

  if (filters.search) {
    const search = String(filters.search).toLowerCase().trim();
    const haystack = `${curso.nome} ${curso.codigo}`.toLowerCase();
    if (!haystack.includes(search)) return false;
  }

  if (Array.isArray(filters.statuses) && filters.statuses.length > 0) {
    if (!filters.statuses.includes(curso.statusPadrao)) return false;
  }

  if (filters.categoriaId != null) {
    if (Number(filters.categoriaId) !== Number(curso.categoriaId)) return false;
  }

  if (filters.subcategoriaId != null) {
    if (Number(filters.subcategoriaId) !== Number(curso.subcategoriaId)) {
      return false;
    }
  }

  return true;
}

function computeNextListData(
  oldData: any,
  curso: Curso,
  action: "create" | "update",
  filters: any,
) {
  if (!oldData || !Array.isArray(oldData.cursos) || !oldData.pagination) {
    return oldData;
  }

  if (!cursoMatchesFilters(curso, filters)) return oldData;

  const page = Number(filters?.page ?? oldData.pagination.page ?? 1);
  if (action === "create" && page !== 1) return oldData;

  const existingIndex = oldData.cursos.findIndex(
    (c: Curso) => String(c.id) === String(curso.id),
  );

  if (action === "update" && existingIndex === -1) return oldData;

  const nextCursos =
    existingIndex === -1
      ? [curso, ...oldData.cursos]
      : oldData.cursos.map((c: Curso, idx: number) =>
          idx === existingIndex ? curso : c,
        );

  const pageSize = oldData.pagination.pageSize || nextCursos.length;
  const nextCursosPage = nextCursos.slice(0, pageSize);

  const total =
    oldData.pagination.total + (action === "create" && existingIndex === -1 ? 1 : 0);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    ...oldData,
    cursos: nextCursosPage,
    pagination: {
      ...oldData.pagination,
      total,
      totalPages,
    },
  };
}

export function optimisticallyUpsertCursoInCursosListQueries(
  queryClient: QueryClient,
  curso: Curso,
  action: "create" | "update",
) {
  const queries = queryClient.getQueryCache().findAll({
    predicate: (q) =>
      Array.isArray(q.queryKey) && q.queryKey[0] === "admin-cursos-list",
  });

  for (const q of queries) {
    const key = q.queryKey as QueryKey;
    const filters = Array.isArray(key) ? (key[1] as any) : undefined;
    const oldData = queryClient.getQueryData<any>(key);
    const nextData = computeNextListData(oldData, curso, action, filters);

    if (nextData !== oldData) {
      queryClient.setQueryData(key, nextData);
    }
  }
}

