"use client";

import { useQuery } from "@tanstack/react-query";
import { listAvaliacoesTurmas } from "@/api/cursos";

interface SelectOption {
  value: string;
  label: string;
}

export interface TurmaSelectOption extends SelectOption {
  metodo: "ONLINE" | "PRESENCIAL" | "LIVE" | "SEMIPRESENCIAL";
}

type TurmaComCurso = {
  id: string;
  codigo: string;
  nome: string;
  cursoId: string;
  metodo: "ONLINE" | "PRESENCIAL" | "LIVE" | "SEMIPRESENCIAL";
  instrutorId: string | null;
  turno: string;
  status: string;
  dataInicio?: string;
  dataFim?: string;
  Cursos: {
    id: string;
    codigo: string;
    nome: string;
  };
  Usuarios: {
    id: string;
    nomeCompleto: string;
    email: string;
  } | null;
};

interface UseTurmasForSelectOptions {
  enabled?: boolean;
}

export function useTurmasForSelect(
  cursoId?: string | null,
  options: UseTurmasForSelectOptions = {}
) {
  const isEnabled = Boolean(cursoId) && (options.enabled ?? true);

  const query = useQuery({
    queryKey: ["avaliacoes-turmas", cursoId],
    queryFn: async () => {
      if (!cursoId) return [];
      // ✅ API implementada: aceita parâmetro cursoId para filtrar turmas
      const response = await listAvaliacoesTurmas(cursoId);
      return response.turmas || [];
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: isEnabled,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const turmas: TurmaSelectOption[] =
    query.data?.map((turma) => ({
      value: turma.id,
      label: `${turma.nome}${turma.Cursos?.nome ? ` - ${turma.Cursos.nome}` : ""}`,
      metodo: turma.metodo,
    })) ?? [];

  return {
    turmas,
    rawData: query.data as TurmaComCurso[] | undefined,
    isLoading: query.isLoading,
    error: query.error,
  };
}
