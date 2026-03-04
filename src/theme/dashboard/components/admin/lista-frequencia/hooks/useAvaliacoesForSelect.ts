"use client";

import { useQuery } from "@tanstack/react-query";
import { listProvas, type TurmaProva } from "@/api/cursos";
import type { SelectOption } from "@/components/ui/custom/select/types";

export type AvaliacaoOrigemTipo = "PROVA" | "ATIVIDADE";

function toOption(item: TurmaProva): SelectOption {
  const titulo = item.titulo || item.nome || "Sem título";
  const codigo = item.codigo?.trim() || "";

  return {
    value: item.id,
    label: titulo,
    searchKeywords: [titulo, codigo].filter(Boolean),
  };
}

export function useAvaliacoesForSelect(params: {
  cursoId: string | null;
  turmaId: string | null;
  tipo: AvaliacaoOrigemTipo;
}) {
  const { cursoId, turmaId, tipo } = params;

  const query = useQuery<TurmaProva[], Error>({
    queryKey: ["frequencia", "avaliacoes-for-select", cursoId, turmaId, tipo],
    queryFn: async () => {
      const res: unknown = await listProvas(cursoId as string, turmaId as string);

      if (Array.isArray(res)) return res as TurmaProva[];
      if (res && typeof res === "object" && "data" in (res as any)) {
        const data = (res as any).data;
        if (Array.isArray(data)) return data as TurmaProva[];
      }
      return [];
    },
    enabled: Boolean(cursoId && turmaId),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const items = Array.isArray(query.data) ? query.data : [];
  const filtered = items.filter((p) => (p.tipo ? p.tipo === tipo : true));

  const options = filtered
    .map(toOption)
    .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));

  const labelById = new Map(
    filtered.map((p) => [p.id, p.titulo || p.nome || null])
  );

  return {
    ...query,
    options,
    labelById,
  };
}
