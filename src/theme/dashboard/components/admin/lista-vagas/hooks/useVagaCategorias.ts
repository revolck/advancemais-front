"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { SelectOption } from "@/components/ui/custom/select/types";
import {
  listEmpresaVagaCategorias,
  type EmpresaVagaCategoria,
  type EmpresaVagaErrorResponse,
} from "@/api/empresas";

function isErrorResponse(
  data: EmpresaVagaCategoria[] | EmpresaVagaErrorResponse
): data is EmpresaVagaErrorResponse {
  return Array.isArray(data) === false;
}

export interface UseVagaCategoriasResult {
  categorias: EmpresaVagaCategoria[];
  categoriaOptions: SelectOption[];
  subcategoriasPorCategoria: Record<string, SelectOption[]>;
  getSubcategoriasOptions: (
    categoriaId: string | number | null
  ) => SelectOption[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para buscar categorias de vagas para formulário.
 * Usa o endpoint: GET /api/v1/empresas/vagas/categorias
 * Mesmo endpoint usado em /dashboard/config/empresas
 */
export function useVagaCategorias(): UseVagaCategoriasResult {
  const [categorias, setCategorias] = useState<EmpresaVagaCategoria[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const carregarCategorias = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await listEmpresaVagaCategorias();

      if (isErrorResponse(response)) {
        throw new Error(response.message || "Erro ao carregar categorias.");
      }

      setCategorias(response);
    } catch (err) {
      console.error("Erro ao buscar categorias de vagas:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao carregar categorias de vagas."
      );
      setCategorias([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarCategorias();
  }, [carregarCategorias]);

  const categoriaOptions = useMemo<SelectOption[]>(
    () =>
      categorias
        .map((categoria) => ({
          value: String(categoria.id),
          label: categoria.nome,
        }))
        .sort((a, b) => a.label.localeCompare(b.label, "pt-BR")),
    [categorias]
  );

  const subcategoriasPorCategoria = useMemo(() => {
    return categorias.reduce<Record<string, SelectOption[]>>(
      (acc, categoria) => {
        const key = String(categoria.id);
        const subcategorias = (categoria.subcategorias ?? []).map((sub) => ({
          value: String(sub.id),
          label: sub.nome,
        }));

        acc[key] = subcategorias.sort((a, b) =>
          a.label.localeCompare(b.label, "pt-BR")
        );
        return acc;
      },
      {}
    );
  }, [categorias]);

  const getSubcategoriasOptions = useCallback(
    (categoriaId: string | number | null) => {
      if (!categoriaId) return [];
      return subcategoriasPorCategoria[String(categoriaId)] ?? [];
    },
    [subcategoriasPorCategoria]
  );

  return {
    categorias,
    categoriaOptions,
    subcategoriasPorCategoria,
    getSubcategoriasOptions,
    isLoading,
    error,
    refetch: carregarCategorias,
  };
}
