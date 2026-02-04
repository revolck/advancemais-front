"use client";

import { useCallback, useEffect, useState } from "react";
import type { SelectOption } from "@/components/ui/custom/select/types";
import { listCursos } from "@/api/cursos";

export function useCursosForSelect() {
  const [options, setOptions] = useState<SelectOption[]>([]);
  // Começa como `true` para evitar flicker (select vazio) antes do primeiro fetch.
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCursos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await listCursos({ page: 1, pageSize: 100 });
      const data = res?.data || [];
      const mapped = data
        .map((c) => ({ value: String(c.id), label: c.nome }))
        .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
      setOptions(mapped);
    } catch (err) {
      const status = (err as any)?.status as number | undefined;
      const msg = err instanceof Error ? err.message : String(err);
      if (status === 404 || /não encontrado|not found/i.test(msg)) {
        setError(null);
      } else {
        console.warn("Aviso: falha ao listar cursos:", msg);
        setError(msg || "Erro ao carregar cursos");
      }
      // Mantém a lista anterior para não “sumir” a seleção em caso de falha temporária.
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCursos();
  }, [fetchCursos]);

  return { cursos: options, isLoading, error, refetch: fetchCursos };
}
