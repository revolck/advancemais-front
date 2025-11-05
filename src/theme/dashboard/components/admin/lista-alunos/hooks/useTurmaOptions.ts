"use client";

import { useCallback, useEffect, useState } from "react";
import type { SelectOption } from "@/components/ui/custom/select/types";
import { listTurmas } from "@/api/cursos";

export function useTurmaOptions(cursoId: string | null) {
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTurmas = useCallback(async () => {
    if (!cursoId) {
      setOptions([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const turmas = await listTurmas(cursoId);
      const mapped = (turmas || []).map((t) => ({ value: String(t.id), label: t.nome }));
      setOptions(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar turmas");
      setOptions([]);
    } finally {
      setIsLoading(false);
    }
  }, [cursoId]);

  useEffect(() => {
    fetchTurmas();
  }, [fetchTurmas]);

  return { turmas: options, isLoading, error, refetch: fetchTurmas };
}

